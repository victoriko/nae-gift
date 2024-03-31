console.log("Deploy script is starting...");
const { ethers } = require("hardhat");

async function deployYourContract({ getNamedAccounts, deployments }) {
  console.log("Deploying contracts with the account:", hre.deployer);

  const { deployer } = await getNamedAccounts();
  console.log("Deployer account:", deployer);

  const { deploy } = deployments;

  console.log("Deploying Escrow...");
  const escrowDeployment = await deploy("Escrow", {
    from: deployer,
    log: true,
    autoMine: true,
  });
  console.log("Escrow deployed to:", escrowDeployment.address);

  console.log("Deploying EscrowProxy...");
  const escrowProxyDeployment = await deploy("EscrowProxy", {
    from: deployer,
    args: [escrowDeployment.address],
    log: true,
    autoMine: true,
  });
  console.log("EscrowProxy deployed to:", escrowProxyDeployment.address);

  const Escrow = await ethers.getContractAt(
    "Escrow",
    escrowDeployment.address,
    await ethers.getSigner(deployer)
  );

  console.log("Success deploy contract:", Escrow.address);
}

module.exports = async ({ getNamedAccounts, deployments }) => {
  await deployYourContract({ getNamedAccounts, deployments });
};
module.exports.tags = ["all", "deploy"];
