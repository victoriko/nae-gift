# Nae-gift service concept

Naegift (a portmanteau of "Nae," meaning "My" in Korean, and "Gift"), leverages the cutting-edge trio of Decentralized Identifiers (DID), Verifiable Credentials (VC), and Smart Contracts (SC) to revolutionize how gifts are exchanged in our decentralized age.

Naegift is designed to foster a trusted and seamless exchange of gifts among three key roles: Sellers (such as shop owners), Gifters (individuals looking to purchase gifts), and Giftees (the recipients of these gifts), all specified by their own DIDs.

Upon registration, Seller can showcase and sell their gifts directly on the Naegift market. Gifter can browse the Naegift market to find the perfect gift. Upon purchase, they can send the digital token of appreciation through the aid of API server. Using this backend server as a medium, Verifiable Gift Credentials issued by the Seller are then handed over to the Giftee, after which the credentials are saved in the Giftee's MetaMask Snap once claimed. 

If the Verifiable Gift Credential corresponding to the very gift exists in MetaMask Snap, the Giftee can then use the VC, requesting verification to the API server. If the credential is neither revoked nor illegitimately altered, it is verified as valid, enabling the Giftee to ask the Seller to deliver the product correspong to the gift physically or digitally.

A pivotal feature of Naegift is its use of an escrow Smart Contract, designed to safeguard both the Gifter and the Giftee against potential fraud. When a gift is purchased, the payment (in Ether) is temporarily held within the escrow SC. Only upon the Giftee's receipt and acknowledgment of the product is the payment released to the Seller's Ethereum account, ensuring a transparent and secure transaction.

# Nae-gift architecture
![alt text](<nae-gift architecture.png>)

