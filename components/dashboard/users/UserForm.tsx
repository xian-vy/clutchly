'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CreateUser, User } from '@/lib/types/users';
import { Organization } from '@/lib/types/organizations';
import { useQuery } from '@tanstack/react-query';
import { getAccessProfiles } from '@/app/api/users/access';
import { AccessProfile } from '@/lib/types/access';

const userFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  confirmPassword: z.string().optional(),
  full_name: z.string().min(2),
  role: z.enum(['admin', 'staff', 'owner'] as const),
  access_profile_id: z.string().uuid(),
  org_id: z.string().uuid(),
}).refine((data) => {
  if (!data.password) return true; // Skip validation if no password (for updates)
  return data.password === data.confirmPassword;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: CreateUser) => Promise<void>;
  onCancel: () => void;
  organization: Organization | undefined;
}

export function UserForm({ initialData, onSubmit, onCancel, organization }: UserFormProps) {
  const { data: accessProfiles } = useQuery<AccessProfile[]>({
    queryKey: ['access-profiles'],
    queryFn: getAccessProfiles,
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: initialData?.full_name || '',
      role: initialData?.role || 'staff',
      access_profile_id: initialData?.access_profile_id || '',
      org_id: organization?.id || '',
    },
  });

  const handleSubmit = async (data: UserFormValues) => {
    await onSubmit(data as CreateUser);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!initialData && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="access_profile_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Profile</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select an access profile" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accessProfiles?.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} User
          </Button>
        </div>
      </form>
    </Form>
  );
} 