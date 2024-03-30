//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    enum ContractChoices{
        ACTIVE,
        FULFILLED,
        EXECUTED
    }

    struct EscrowData{
        address buyer;
        address seller;
        address receiver;
        address market;
        uint256 contractPrice;
        ContractChoices State;
        }

    mapping(string => EscrowData) public escrows;

    event EscrowCreated(string uuid);
    event FulfillmentConfirmed(string uuid, address indexed market);
    event ProductUsedConfirmed(string uuid, address indexed receiver);
    event FundsDistributed(string uuid, address indexed market, uint256 marketShare, address indexed seller, uint256 sellerShare);

    function createEscrow(
        string memory uuid,
        address _buyer,
        address _seller,
        address _receiver,
        address _market,
        uint256 _contractPrice
    ) public payable{
        require(msg.value >= _contractPrice, "e002");
        require(msg.sender == _buyer, "e003");
        require(escrows[uuid].buyer == address(0), "escrow already");

        escrows[uuid]=EscrowData({
            buyer: _buyer,
            seller: _seller,
            receiver: _receiver,
            market: _market,
            contractPrice: _contractPrice,
            State: ContractChoices.ACTIVE
        });

        emit EscrowCreated(uuid);
    }

    function ConfirmFulfillment(string memory uuid)public{
        require(msg.sender == escrows[uuid].market, "e020");
        require(escrows[uuid].State == ContractChoices.ACTIVE, "e004");
        escrows[uuid].State = ContractChoices.FULFILLED;
        emit FulfillmentConfirmed(uuid, escrows[uuid].market);
    }

    function ConfirmProductUsed(string memory uuid) public{
        require(msg.sender == escrows[uuid].market, "e020");
        require(escrows[uuid].State == ContractChoices.FULFILLED, "e005");
        escrows[uuid].State = ContractChoices.EXECUTED;
        emit ProductUsedConfirmed(uuid, escrows[uuid].receiver);
        DistributeFunds(uuid);
    }

    function DistributeFunds(string memory uuid) public{
        require(escrows[uuid].State == ContractChoices.EXECUTED, "e006");
        EscrowData storage escrow = escrows[uuid];
        uint256 marketShare = escrow.contractPrice /10;
        uint256 sellerShare = escrow.contractPrice - marketShare;
        payable(escrow.market).transfer(marketShare);
        payable(escrow.seller).transfer(sellerShare);
        emit FundsDistributed(uuid, escrow.market, marketShare, escrow.seller, sellerShare);
        }

    function escrowStatus(string memory uuid) public view returns(ContractChoices){
        return escrows[uuid].State;
    }

    receive() external payable{}
}