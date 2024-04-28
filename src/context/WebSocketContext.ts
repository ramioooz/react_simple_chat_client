import { createContext } from "react";

import { Socket, io } from "socket.io-client";

export const socketIO = io("http://localhost:3000", { autoConnect: false});

export const SocketContext = createContext<Socket>(socketIO);



// export const TableDataContextProvider = ({ children }) => {

//     const [state, dispatch] = useReducer(reducer, initialState);
//     // console.log('TableDataContext state is : ', state);

//     return <TableDataContext.Provider value={{ state, dispatch }}>
//         {children}
//     </TableDataContext.Provider>
// }

