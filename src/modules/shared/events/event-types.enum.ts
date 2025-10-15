export enum EventTypes {
  QUEST = 'QUEST',
  NEWBIE_LOGIN = 'NEWBIE_LOGIN',
}

export enum ClanBroadcastEventType {
  JOIN_REQUEST = 'clan.broadcast.join-request',
  JOIN_APPROVED = 'clan.broadcast.join-approved',
  JOIN_REJECTED = 'clan.broadcast.join-rejected',
  MEMBER_KICKED = 'clan.broadcast.member-kicked',
  ROLE_PROMOTED = 'clan.broadcast.role-promoted',
  ROLE_DEMOTED = 'clan.broadcast.role-demoted',
  NEW_LEADER_ASSIGNED = 'clan.broadcast.new-leader-assigned',
}
