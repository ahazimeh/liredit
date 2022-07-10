import { useRouter } from "next/router";

export const useGetIntId = () => {
  const router = useRouter();
  const intId = +(router.query.id || -1);
  return intId;
};
