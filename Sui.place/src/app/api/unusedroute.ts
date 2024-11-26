// import { NextResponse } from 'next/server'
// import TronWeb from 'tronweb'

// const TRON_FULL_NODE = process.env.TRON_FULL_NODE || 'https://api.trongrid.io'
// const TRON_SOLIDITY_NODE = process.env.TRON_SOLIDITY_NODE || 'https://api.trongrid.io'
// const TRON_EVENT_SERVER = process.env.TRON_EVENT_SERVER || 'https://api.trongrid.io'
// const PRIVATE_KEY = process.env.TRON_PRIVATE_KEY || ''
// const CONTRACT_ADDRESS = process.env.TRX_CONTRACT_ADDRESS || ''

// const tronWeb = new TronWeb(
//   TRON_FULL_NODE,
//   TRON_SOLIDITY_NODE,
//   TRON_EVENT_SERVER,
//   PRIVATE_KEY
// )

// interface CartItem {
//   id: number;
//   title: string;
//   price: number;
//   quantity: number;
// }

// interface PurchaseRequest {
//   cart: CartItem[];
//   totalTRX: number;
//   userAddress: string;
// }

// export async function POST(request: Request) {
//   try {
//     const { cart, totalTRX, userAddress }: PurchaseRequest = await request.json();

//     // Verify the payment amount
//     const balance = await tronWeb.trx.getBalance(userAddress);
//     if (balance < totalTRX) {
//       return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
//     }

//     // Process the purchase
//     const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

//     const result = await contract.processPurchase(cart.map(game => game.id)).send({
//       callValue: totalTRX,
//       shouldPollResponse: true,
//     });

//     // Handle successful purchase (e.g., update database, send confirmation email, etc.)

//     return NextResponse.json({ success: true, transactionId: result });
//   } catch (error) {
//     console.error('Purchase processing error:', error);
//     return NextResponse.json({ error: 'Purchase processing failed' }, { status: 500 });
//   }
// }