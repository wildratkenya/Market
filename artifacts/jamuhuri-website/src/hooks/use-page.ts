import { useQuery } from "@tanstack/react-query";

interface PageData {
  id?: number;
  pageName: string;
  pageTitle: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroDescription: string | null;
  heroImage: string | null;
  heroButton: string | null;
  heroButtonText: string | null;
  bodyContent: string | null;
  footerContent: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  socialLinks: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export function usePage(name: string) {
  const { data, isLoading, error } = useQuery<PageData | null, Error>({
    queryKey: ["/api/pages", name],
    queryFn: async () => {
      const res = await fetch(`/api/pages/${name}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return { data: data ?? null, loading: isLoading, error: error?.message ?? null };
}
