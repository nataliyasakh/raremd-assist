import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { User, Hospital, GraduationCap, Phone, MapPin, Award, BookOpen, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPhysicianSchema, type Physician } from "@shared/schema";

const physicianFormSchema = insertPhysicianSchema.extend({
  boardCertifications: z.array(z.string()).optional(),
  researchInterests: z.array(z.string()).optional(),
  publications: z.array(z.string()).optional(),
  professionalMemberships: z.array(z.string()).optional(),
  preferredReferralCenters: z.array(z.string()).optional(),
  rareDiseaseFocus: z.array(z.string()).optional(),
});

type PhysicianFormData = z.infer<typeof physicianFormSchema>;

export default function PhysicianProfile() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // For demo purposes, using a mock user ID - in production this would come from auth
  const mockUserId = "physician-001";

  const { data: physician, isLoading } = useQuery({
    queryKey: [`/api/physicians/by-user/${mockUserId}`],
    retry: false,
  });

  const form = useForm<PhysicianFormData>({
    resolver: zodResolver(physicianFormSchema),
    defaultValues: physician || {
      userId: mockUserId,
      licenseNumber: "",
      specialty: "",
      subSpecialty: "",
      hospitalAffiliation: "",
      clinicName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      yearsOfExperience: 0,
      boardCertifications: [],
      researchInterests: [],
      publications: [],
      professionalMemberships: [],
      emergencyContact: "",
      preferredReferralCenters: [],
      geneticsTraining: "",
      rareDiseaseFocus: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PhysicianFormData) => apiRequest("/api/physicians", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/physicians/by-user/${mockUserId}`] });
      setIsEditing(false);
      toast({
        title: "Profile Created",
        description: "Your physician profile has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create physician profile.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PhysicianFormData) => 
      apiRequest(`/api/physicians/${physician.id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/physicians/by-user/${mockUserId}`] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your physician profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update physician profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PhysicianFormData) => {
    if (physician) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Physician Profile</h1>
          <p className="text-gray-600">Manage your professional information and credentials</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {!physician && !isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Physician Profile</CardTitle>
            <CardDescription>
              Set up your professional profile to get personalized recommendations and connect with the medical community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsEditing(true)}>
              <User className="h-4 w-4 mr-2" />
              Create Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="licenseNumber">Medical License Number</Label>
                  <Input
                    id="licenseNumber"
                    {...form.register("licenseNumber")}
                    disabled={!isEditing}
                    placeholder="Enter your medical license number"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Primary Specialty</Label>
                  <Input
                    id="specialty"
                    {...form.register("specialty")}
                    disabled={!isEditing}
                    placeholder="e.g., Pediatrics, Internal Medicine"
                  />
                </div>
                <div>
                  <Label htmlFor="subSpecialty">Sub-Specialty</Label>
                  <Input
                    id="subSpecialty"
                    {...form.register("subSpecialty")}
                    disabled={!isEditing}
                    placeholder="e.g., Medical Genetics, Cardiology"
                  />
                </div>
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    {...form.register("yearsOfExperience", { valueAsNumber: true })}
                    disabled={!isEditing}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Practice Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hospital className="h-5 w-5" />
                  Practice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hospitalAffiliation">Hospital Affiliation</Label>
                  <Input
                    id="hospitalAffiliation"
                    {...form.register("hospitalAffiliation")}
                    disabled={!isEditing}
                    placeholder="Primary hospital or health system"
                  />
                </div>
                <div>
                  <Label htmlFor="clinicName">Clinic/Practice Name</Label>
                  <Input
                    id="clinicName"
                    {...form.register("clinicName")}
                    disabled={!isEditing}
                    placeholder="Your clinic or practice name"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    disabled={!isEditing}
                    placeholder="Practice address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                      disabled={!isEditing}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...form.register("state")}
                      disabled={!isEditing}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    disabled={!isEditing}
                    placeholder="Professional phone number"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Credentials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Professional Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="geneticsTraining">Genetics Training</Label>
                <Textarea
                  id="geneticsTraining"
                  {...form.register("geneticsTraining")}
                  disabled={!isEditing}
                  placeholder="Describe your genetics training and certifications"
                  rows={3}
                />
              </div>
              <div>
                <Label>Board Certifications</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {physician?.boardCertifications?.map((cert, index) => (
                    <Badge key={index} variant="secondary">
                      {cert}
                    </Badge>
                  )) || <p className="text-sm text-gray-500">No certifications listed</p>}
                </div>
              </div>
              <div>
                <Label>Professional Memberships</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {physician?.professionalMemberships?.map((membership, index) => (
                    <Badge key={index} variant="outline">
                      {membership}
                    </Badge>
                  )) || <p className="text-sm text-gray-500">No memberships listed</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Research & Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Research & Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rare Disease Focus Areas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {physician?.rareDiseaseFocus?.map((disease, index) => (
                    <Badge key={index} variant="default">
                      {disease}
                    </Badge>
                  )) || <p className="text-sm text-gray-500">No focus areas specified</p>}
                </div>
              </div>
              <div>
                <Label>Research Interests</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {physician?.researchInterests?.map((interest, index) => (
                    <Badge key={index} variant="secondary">
                      {interest}
                    </Badge>
                  )) || <p className="text-sm text-gray-500">No research interests listed</p>}
                </div>
              </div>
              <div>
                <Label>Preferred Referral Centers</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {physician?.preferredReferralCenters?.map((center, index) => (
                    <Badge key={index} variant="outline">
                      {center}
                    </Badge>
                  )) || <p className="text-sm text-gray-500">No referral centers specified</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? "Saving..." 
                  : physician ? "Update Profile" : "Create Profile"
                }
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}