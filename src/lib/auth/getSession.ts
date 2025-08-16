import { headers } from "next/headers";
import { auth } from "../auth";

const getSession = async () =>
  await auth.api.getSession({
    headers: await headers(),
  });

export default getSession;
