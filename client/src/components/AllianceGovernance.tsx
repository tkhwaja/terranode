import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Vote, Plus, Check, X, Clock, Users } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AllianceGovernanceProps {
  allianceId: number;
  isLeader?: boolean;
}

export default function AllianceGovernance({ allianceId, isLeader = false }: AllianceGovernanceProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general",
    endsAt: "",
  });

  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: [`/api/alliances/${allianceId}/proposals`],
    refetchInterval: 30000,
  });

  const createProposalMutation = useMutation({
    mutationFn: async (proposalData: any) => {
      return await apiRequest(`/api/alliances/${allianceId}/proposals`, {
        method: 'POST',
        body: JSON.stringify(proposalData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Proposal Created",
        description: "Your proposal has been submitted for voting.",
      });
      setShowCreateForm(false);
      setFormData({ title: "", description: "", type: "general", endsAt: "" });
      queryClient.invalidateQueries({ queryKey: [`/api/alliances/${allianceId}/proposals`] });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, vote }: { proposalId: number; vote: string }) => {
      return await apiRequest(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ vote }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Vote Recorded",
        description: "Your vote has been successfully recorded.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/alliances/${allianceId}/proposals`] });
    },
    onError: (error) => {
      toast({
        title: "Vote Failed",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProposalMutation.mutate({
      ...formData,
      endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
    });
  };

  const handleVote = (proposalId: number, vote: string) => {
    voteMutation.mutate({ proposalId, vote });
  };

  const getProposalStatus = (proposal: any) => {
    const now = new Date();
    const endsAt = proposal.endsAt ? new Date(proposal.endsAt) : null;
    
    if (endsAt && now > endsAt) {
      return 'ended';
    }
    if (proposal.isActive) {
      return 'active';
    }
    return 'inactive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'ended':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (proposalsLoading) {
    return (
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse space-y-3 sm:space-y-4">
            <div className="h-6 bg-gray-800/50 rounded w-1/3"></div>
            <div className="space-y-2 sm:space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 sm:h-24 bg-gray-800/50 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const proposalList = proposals || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-light text-white flex items-center space-x-2">
              <Vote className="w-5 h-5 text-cyan-400" />
              <span>ALLIANCE GOVERNANCE</span>
            </CardTitle>
            {isLeader && (
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Proposal
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Create Proposal Form */}
      {showCreateForm && (
        <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-light text-white">
              CREATE NEW PROPOSAL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300 text-sm uppercase tracking-wider">
                  Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400"
                  placeholder="Enter proposal title"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300 text-sm uppercase tracking-wider">
                  Description
                </Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400"
                  placeholder="Describe your proposal in detail"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-gray-300 text-sm uppercase tracking-wider">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-400">
                    <SelectValue placeholder="Select proposal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="staking">Staking</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="endsAt" className="text-gray-300 text-sm uppercase tracking-wider">
                  Voting Deadline (Optional)
                </Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, endsAt: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-400"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={createProposalMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {createProposalMutation.isPending ? "Creating..." : "Create Proposal"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Proposals List */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-white">
            ACTIVE PROPOSALS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposalList.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Vote className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No proposals yet</p>
                <p className="text-sm">Create the first proposal to start governance!</p>
              </div>
            ) : (
              proposalList.map((proposal: any) => {
                const status = getProposalStatus(proposal);
                const totalVotes = proposal.votesYes + proposal.votesNo + proposal.votesAbstain;
                const yesPercentage = totalVotes > 0 ? (proposal.votesYes / totalVotes) * 100 : 0;
                const noPercentage = totalVotes > 0 ? (proposal.votesNo / totalVotes) * 100 : 0;

                return (
                  <div
                    key={proposal.id}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-cyan-600/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-white">{proposal.title}</h4>
                          <Badge variant="outline" className={getStatusColor(status)}>
                            {status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {proposal.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          {proposal.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            Created {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                          </span>
                          {proposal.endsAt && (
                            <span>
                              Ends {format(new Date(proposal.endsAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Voting Results */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Total Votes: {totalVotes}</span>
                        <div className="flex space-x-4">
                          <span className="text-green-400">Yes: {proposal.votesYes}</span>
                          <span className="text-red-400">No: {proposal.votesNo}</span>
                          <span className="text-gray-400">Abstain: {proposal.votesAbstain}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-400">Yes</span>
                          <span className="text-green-400">{yesPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={yesPercentage} className="h-2" />
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-red-400">No</span>
                          <span className="text-red-400">{noPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={noPercentage} className="h-2" />
                      </div>
                    </div>

                    {/* Voting Buttons */}
                    {status === 'active' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleVote(proposal.id, 'yes')}
                          disabled={voteMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Yes
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVote(proposal.id, 'no')}
                          disabled={voteMutation.isPending}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <X className="w-4 h-4 mr-1" />
                          No
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(proposal.id, 'abstain')}
                          disabled={voteMutation.isPending}
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Abstain
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}