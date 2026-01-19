import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Loader2, Building2, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SupporterApplication = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    companySize: "",
    yearlyRevenue: "",
    industry: "",
    location: "",
    whatTheyOffer: "",
    aboutThem: "",
    whySupporter: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.companyName.trim() &&
      formData.companySize &&
      formData.industry &&
      formData.location.trim() &&
      formData.whatTheyOffer.trim() &&
      formData.aboutThem.trim() &&
      formData.whySupporter.trim()
    );
  };

  const handleSubmit = async () => {
    if (!user || !isFormValid()) return;

    setIsLoading(true);
    
    const { error } = await supabase
      .from("supporter_applications")
      .insert({
        user_id: user.id,
        company_name: formData.companyName,
        company_size: formData.companySize,
        yearly_revenue: formData.yearlyRevenue || null,
        industry: formData.industry,
        location: formData.location,
        what_they_offer: formData.whatTheyOffer,
        about_them: formData.aboutThem,
        why_supporter: formData.whySupporter,
      });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Failed to submit application",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Application submitted!",
        description: "We'll review your application and get back to you soon.",
      });
      navigate("/");
    }
  };

  const companySizes = [
    { value: "solo", label: "Solo / Freelancer" },
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "500+", label: "500+ employees" },
  ];

  const revenueRanges = [
    { value: "0-50k", label: "Less than $50k" },
    { value: "50k-250k", label: "$50k - $250k" },
    { value: "250k-1m", label: "$250k - $1M" },
    { value: "1m-5m", label: "$1M - $5M" },
    { value: "5m+", label: "$5M+" },
    { value: "prefer-not-say", label: "Prefer not to say" },
  ];

  const industries = [
    { value: "restaurant", label: "Restaurant / Café" },
    { value: "hotel", label: "Hotel / Hospitality" },
    { value: "retail", label: "Retail" },
    { value: "fitness", label: "Fitness / Gym" },
    { value: "salon", label: "Salon / Spa" },
    { value: "nonprofit", label: "Non-profit Organization" },
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary glow-green">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Become a Supporter</h1>
            <p className="text-muted-foreground text-sm">Apply to offer rewards and support changemakers</p>
          </div>
        </div>

        {/* Safety Notice */}
        <Card className="border-swap-gold/30 bg-swap-gold/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <Shield className="h-5 w-5 text-swap-gold flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-swap-gold">Safety First</p>
              <p className="text-muted-foreground">
                To protect our community, all supporter applications are carefully reviewed by our team. 
                We primarily accept businesses and verified organizations. Private individuals may be 
                subject to additional verification.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>Tell us about your business or organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Business / Organization Name *</Label>
              <Input
                id="companyName"
                placeholder="e.g., Sunrise Café"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
              />
            </div>

            {/* Company Size & Revenue */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Team Size *</Label>
                <Select value={formData.companySize} onValueChange={(v) => handleChange("companySize", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Yearly Revenue (optional)</Label>
                <Select value={formData.yearlyRevenue} onValueChange={(v) => handleChange("yearlyRevenue", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {revenueRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Industry & Location */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Industry *</Label>
                <Select value={formData.industry} onValueChange={(v) => handleChange("industry", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location / City *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Berlin, Germany"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What They Offer */}
        <Card>
          <CardHeader>
            <CardTitle>What will you offer?</CardTitle>
            <CardDescription>Describe the rewards or services you can provide to changemakers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatTheyOffer">Your Offerings *</Label>
              <Textarea
                id="whatTheyOffer"
                placeholder="e.g., We offer free coffee and breakfast to changemakers who show their SWAP rewards. We can also provide a warm meal during lunch hours..."
                value={formData.whatTheyOffer}
                onChange={(e) => handleChange("whatTheyOffer", e.target.value)}
                className="h-28"
              />
              <p className="text-xs text-muted-foreground">
                Examples: free meals, shower access, overnight stays, discounts, services, etc.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* About Them */}
        <Card>
          <CardHeader>
            <CardTitle>About You & Your Story</CardTitle>
            <CardDescription>Help us get to know you better</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aboutThem">Tell us about yourself *</Label>
              <Textarea
                id="aboutThem"
                placeholder="Share your story - who you are, what you do, and your connection to the community..."
                value={formData.aboutThem}
                onChange={(e) => handleChange("aboutThem", e.target.value)}
                className="h-28"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whySupporter">Why do you want to become a Supporter? *</Label>
              <Textarea
                id="whySupporter"
                placeholder="What motivates you to support changemakers? Why is this cause important to you?"
                value={formData.whySupporter}
                onChange={(e) => handleChange("whySupporter", e.target.value)}
                className="h-28"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid() || isLoading}
          size="lg"
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Applications are typically reviewed within 2-3 business days.
        </p>
      </div>
    </div>
  );
};

export default SupporterApplication;
