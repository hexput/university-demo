import { Service } from "encore.dev/service";
import { middleware, APIError } from "encore.dev/api";
import { prisma } from "../database";
import { getAuthData } from "~encore/auth";
import { AuthData } from "../auth/auth";

export const adminPermissionCheck = middleware(
  { target: { auth: true } },
  async (req, next) => {
    const authData: AuthData = getAuthData();

    if (!authData) {
      throw APIError.permissionDenied("User not found");
    }

    const universityId = req.requestMeta?.parsedPayload?.universityId;

    if (!universityId) {
      return next(req);
    }

    const university = await prisma.university.findUnique({
      where: {
        id: Number(universityId),
      }
    });
    
    if (!university) {
      throw APIError.notFound("University not found");
    }

    const userRole = await prisma.userRole.findUnique({
      where: {
        userId_universityId: {
          userId: Number(authData.userID),
          universityId: Number(universityId)
        }
      }
    });

    if (!authData.system_admin && (!userRole || userRole.role !== "ADMIN")) {
      throw APIError.notFound("University or university member not found");
    }

    return next(req);
  }
);

export default new Service("admin", {
  middlewares: [adminPermissionCheck]
});


