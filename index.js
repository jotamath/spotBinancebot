//Monitoramento ✅
//Estratégia ✅
//Trade ✅

const WebSocket = require('ws');
const ws = new WebSocket(`${process.env.STREAM_URL}/${process.env.SYMBOL.toLowerCase()}@ticker`);

const PROFITABILITY = parseFloat(process.env.PROFITABILITY);
let sellPrice = 0;

ws.onmessage = (event) => {
    console.clear();
    const obj = JSON.parse(event.data);
    console.log(`Symbol: ${obj.s}`);
    console.log(`Ask Price: ${obj.a}`);


    const currentPrice = parseFloat(obj.a);
    if(sellPrice === 0 && currentPrice < 960){
        console.log('Compra');
        newOrder("0.001", "BUY");
        sellPrice = currentPrice * PROFITABILITY;
    } else if(sellPrice !== 0  && currentPrice >= sellPrice) {
        console.log('Venda');
        newOrder("0.001", "SELL");
        sellPrice = 0;
    } else {
        console.log("Aguardando... Preço para venda: " + sellPrice);
    }
}

const axios = require('axios');
const crypto = require('crypto');

async function newOrder(quantity, side){

    const data = {
        symbol: process.env.SYMBOL,
        type: 'MARKET',
        side,
        quantity
    };

    const timestamp = Date.now();
    const recvWindow = 60000;
    const signature = crypto
        .createHmac('sha256', process.env.SECRET_KEY)
        .update(`${new URLSearchParams({...data,timestamp,recvWindow})}`)
        .digest('hex');
    
    const newData = {...data, timestamp, recvWindow, signature};
    const qs = `?${new URLSearchParams(newData)}`

    try{
        const result = await axios({
            method:'POST',
            url: `${process.env.API_URL}/v3/order${qs}`,
            headers: { 'X-MBX-APIKEY': process.env.API_KEY }
        })
        console.log(result.data);
    } catch(err) {
        console.error(err);
    }
    
}