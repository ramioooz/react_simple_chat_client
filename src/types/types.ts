type typingObjType = {
  clientName: string;
  isTyping: boolean;
};

type userType = {
  userName: string;
  clientId: string;
};

type msgType = userType & {
  dateTime: Date;
  content: String;
};

export type { userType, msgType, typingObjType };
