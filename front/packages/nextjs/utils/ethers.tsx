import { ethers } from "ethers";
import Swal from "sweetalert2";

export async function runEthers(
  title: string | null = null,
  content: string | null = null,
  price: string | null = null,
) {
  try {
    if (typeof window.ethereum === "undefined") {
      throw new Error("Ethereum wallet not found");
    }

    const ethereum = window.ethereum as any;
    const provider = new ethers.providers.Web3Provider(ethereum);
    console.log("provider: ", provider);

    const wallets = await ethereum.request({
      method: "eth_requestAccounts",
    });
    const address = wallets[0];
    console.log("address: ", address);

    const signer = provider.getSigner(address);
    // const ethPrice = ethers.utils.parseUnits(price, "ether");
    const message = {
      title,
      content,
      price,
    };

    const signature = await signer.signMessage(JSON.stringify(message));
    console.log("Message sign post body: ", { ...message, signature });

    const messageSeller = ethers.utils.verifyMessage(JSON.stringify(message), signature);
    console.log("messageSeller: ", messageSeller);

    return { message, signature };
  } catch (error) {
    console.error("Error running ethers:", error);
    Swal.fire({
      icon: "error",
      text: "Signature denied. Please try again.",
    });
    throw error;
  }
}
