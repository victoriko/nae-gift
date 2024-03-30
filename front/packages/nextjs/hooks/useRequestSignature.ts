import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

const useRequestSignature = () => {
  const { isConnected } = useAccount();
  const { signMessage, data: signedMessage, error } = useSignMessage();
  const [isSigned, setIsSigned] = useState(false); // 서명 완료 상태 추가
  const data = useSignMessage();
  useEffect(() => {
    const requestSignature = async () => {
      console.log(data);
      if (isConnected && !isSigned) {
        // 이미 서명이 완료되지 않았을 경우에만 서명 요청
        const message = "login plz";
        try {
          await signMessage({ message });
          console.log("서명 성공:", signedMessage);
          setIsSigned(true); // 서명 완료 상태를 true로 설정
        } catch (error) {
          console.error("서명 오류:", error);
        }
      }
    };

    requestSignature();
  }, [isConnected, signMessage, signedMessage]);

  return { signedMessage, error, isSigned }; // 서명 완료 상태 반환
};

export default useRequestSignature;
