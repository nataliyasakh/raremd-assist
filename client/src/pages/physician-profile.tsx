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
import { User, Hospital, GraduationCap, Phone, MapPin, Award, BookOpen, Users, Mail } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const physicianFormSchema = z.object({
  userId: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  specialty: z.string().min(1, "Specialty is required"),
  subSpecialty: z.string().optional(),
  hospitalAffiliation: z.string().optional(),
  clinicName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  boardCertifications: z.string().optional(),
  researchInterests: z.string().optional(),
  publications: z.string().optional(),
  professionalMemberships: z.string().optional(),
  emergencyContact: z.string().optional(),
  preferredReferralCenters: z.string().optional(),
  geneticsTraining: z.string().optional(),
  rareDiseaseFocus: z.string().optional(),
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
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      licenseNumber: "",
      specialty: "",
      subSpecialty: "",
      hospitalAffiliation: "",
      clinicName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      yearsOfExperience: 0,
      boardCertifications: "",
      researchInterests: "",
      publications: "",
      professionalMemberships: "",
      emergencyContact: "",
      preferredReferralCenters: "",
      geneticsTraining: "",
      rareDiseaseFocus: "",
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
        description: "Failed to create profile. Please try again.",
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
        description: "Failed to update profile. Please try again.",
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
      ) : physician && !isEditing ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Dr. {physician.firstName} {physician.lastName}
                  </h3>
                  <p className="text-muted-foreground">{physician.specialty}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {physician.email}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {physician.phone}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">License Number:</span>
                  <span className="text-sm">{physician.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Years of Experience:</span>
                  <span className="text-sm">{physician.yearsOfExperience || 0} years</span>
                </div>
                {physician.hospitalAffiliation && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Hospital:</span>
                    <span className="text-sm">{physician.hospitalAffiliation}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="h-5 w-5" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {physician.subSpecialty && (
                <div>
                  <Label className="text-sm font-medium">Sub-Specialty</Label>
                  <p className="text-sm text-muted-foreground">{physician.subSpecialty}</p>
                </div>
              )}
              
              {physician.boardCertifications && (
                <div>
                  <Label className="text-sm font-medium">Board Certifications</Label>
                  <p className="text-sm text-muted-foreground">{physician.boardCertifications}</p>
                </div>
              )}
              
              {physician.geneticsTraining && (
                <div>
                  <Label className="text-sm font-medium">Genetics Training</Label>
                  <p className="text-sm text-muted-foreground">{physician.geneticsTraining}</p>
                </div>
              )}
              
              {physician.rareDiseaseFocus && (
                <div>
                  <Label className="text-sm font-medium">Rare Disease Focus</Label>
                  <p className="text-sm text-muted-foreground">{physician.rareDiseaseFocus}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="Enter first name"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Enter last name"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="Enter email address"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="Enter phone number"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hospital className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Medical License Number *</Label>
                  <Input
                    id="licenseNumber"
                    {...form.register("licenseNumber")}
                    placeholder="Enter license number"
                  />
                  {form.formState.errors.licenseNumber && (
                    <p className="text-sm text-red-500">{form.formState.errors.licenseNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Medical Specialty *</Label>
                  <Input
                    id="specialty"
                    {...form.register("specialty")}
                    placeholder="e.g., Pediatrics, Genetics"
                  />
                  {form.formState.errors.specialty && (
                    <p className="text-sm text-red-500">{form.formState.errors.specialty.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subSpecialty">Sub-Specialty</Label>
                  <Input
                    id="subSpecialty"
                    {...form.register("subSpecialty")}
                    placeholder="e.g., Medical Genetics, Cardiology"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    {...form.register("yearsOfExperience", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospitalAffiliation">Hospital Affiliation</Label>
                  <Input
                    id="hospitalAffiliation"
                    {...form.register("hospitalAffiliation")}
                    placeholder="Primary hospital or health system"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic/Practice Name</Label>
                  <Input
                    id="clinicName"
                    {...form.register("clinicName")}
                    placeholder="Private practice or clinic name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="boardCertifications">Board Certifications</Label>
                <Textarea
                  id="boardCertifications"
                  {...form.register("boardCertifications")}
                  placeholder="List your board certifications (comma separated)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geneticsTraining">Genetics Training</Label>
                <Input
                  id="geneticsTraining"
                  {...form.register("geneticsTraining")}
                  placeholder="Describe your genetics/genomics training"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rareDiseaseFocus">Rare Disease Focus Areas</Label>
                <Textarea
                  id="rareDiseaseFocus"
                  {...form.register("rareDiseaseFocus")}
                  placeholder="Specific rare diseases or conditions you focus on"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : physician
                ? "Update Profile"
                : "Create Profile"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}