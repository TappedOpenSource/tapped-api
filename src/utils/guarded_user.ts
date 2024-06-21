import { GuardedUserModel, UserModel } from "../types/user_model";

export function transformUser(user: UserModel): GuardedUserModel {
  return {
    id: user.id,
    username: user.username,
    displayName: user.artistName,
    bio: user.bio,
    profilePicture: user.profilePicture,
    location: user.location,
    socialFollowing: user.socialFollowing,
    genres: user.performerInfo?.genres ?? [],
    ...user.performerInfo,
  };
}