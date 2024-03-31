// import { useEffect, useState } from "react";
// import { CONSTANTS, PushAPI } from "@pushprotocol/restapi";
// import { useAccount, useWalletClient } from "wagmi";

// const useWalletAndSubscribe = () => {
//   const { address, isConnected } = useAccount();
//   const [notificationData, setNotificationData] = useState<any[]>([]);
//   const [streamInstance, setStreamInstance] = useState<any | null>(null);
//   const [user, setUser] = useState<any | null>(null);
//   const result1 = useWalletClient({
//     chainId: 11155111,
//   });

//   const channelAddress = "0x3C51F308502c5fde8c7C1Fa39d35aA621838F7DF";

//   const initRealTimeNotificationStream = async (user: any) => {
//     if (!streamInstance && user) {
//       try {
//         const newStream = await user.initStream([CONSTANTS.STREAM.NOTIF]);
//         newStream.on(CONSTANTS.STREAM.NOTIF, (data: any) => {
//           console.log("받은 데이터:", data.message.notification);
//           setNotificationData((oldData: any) => [...oldData, data]);
//         });
//         newStream.connect();
//         setStreamInstance(newStream);
//       } catch (error) {
//         console.error("스트림 초기화 중 오류 발생:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     const connectAndSubscribe = async (signer: any) => {
//       try {
//         if (isConnected && address) {
//           console.log(data);
//           console.log(`wallet ${address} is connected`);
//           // useWalletClient 훅의 결과인 data를 PushAPI.initialize에 전달합니다.
//           const initializedUser = await PushAPI.initialize(signer, {
//             env: CONSTANTS.ENV.STAGING,
//           });
//           setUser(initializedUser);

//           const subscriptions = await initializedUser.notification.subscriptions();
//           const isSubscribed = subscriptions.some(
//             (sub: any) => sub.channel.toLowerCase() === channelAddress.toLowerCase(),
//           );
//           if (!isSubscribed) {
//             await initializedUser.notification.subscribe(`eip155:11155111:${channelAddress}`);
//           }

//           await initRealTimeNotificationStream(initializedUser);
//         }
//       } catch (error) {
//         console.error("연결 및 구독 중 오류 발생:", error);
//       }
//     };

//     connectAndSubscribe(signer);
//   }, [isConnected, address, result1]); // useEffect 의존성 배열에 data 추가

//   return { isConnected, notificationData, streamInstance, user };
// };

// export default useWalletAndSubscribe;
