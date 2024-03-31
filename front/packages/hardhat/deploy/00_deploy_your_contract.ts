import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const escrowDeployment = await deploy("Escrow", {
    from: deployer,
    log: true,
    autoMine: true,
  });

  await deploy("EscrowProxy", {
    from: deployer,
    args: [escrowDeployment.address],
    log: true,
    autoMine: true,
  });

  const Escrow = await hre.ethers.getContract<Contract>("Escrow", deployer);
  console.log("Success deploy contract:", Escrow.target);
};

export default deployYourContract;
deployYourContract.tags = ["Escrow"];
