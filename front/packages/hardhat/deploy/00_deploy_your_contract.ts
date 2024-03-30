import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // 먼저 "Escrow" 계약을 배포합니다.
  const escrowDeployment = await deploy("Escrow", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  // "Escrow" 계약이 배포된 후, 그 주소를 사용하여 "EscrowProxy" 계약을 배포합니다.
  await deploy("EscrowProxy", {
    from: deployer,
    args: [escrowDeployment.address], // "Escrow" 계약의 주소를 생성자 인자로 전달
    log: true,
    autoMine: true,
  });

  // 배포된 "Escrow" 계약과 상호작용하기 위해 가져옵니다.
  const Escrow = await hre.ethers.getContract<Contract>("Escrow", deployer);
  console.log("Escrow 계약이 성공적으로 배포되었습니다:", Escrow.target);
};

export default deployYourContract;
deployYourContract.tags = ["Escrow"];
