import { unauthorized } from "next/navigation";
import getSession from "./getSession";

const getRequiredSession = async () => {
  const session = await getSession();

  if (session === null) {
    unauthorized();
  }

  return session;
};

export default getRequiredSession;
