const axios = require('axios') 
const Web3 = require('web3')     
const web3 = new Web3("https://mainnet.infura.io/v3/f97352413d18487fba5eefb1e3355f7d")   

const ASC_ABI = require('./ABI/ASC')
const ASC_ADDRESS = "0xeE479f62ec8cD0A93D5a603b60A038C3475e46cD" 
const SENDER_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"


const getData = async ( fromToken, toToken, value ) => {
    try{ 

        // Get fee percentage from ASC 
        const ASC = new web3.eth.Contract(ASC_ABI, ASC_ADDRESS) 
        const feePercentageInWei = await ASC.methods.fee().call()
        const feePercentage = web3.utils.fromWei(feePercentageInWei.toString(), 'ether')
        


        // Get swap calldata from 1INCH API
        if(!isNaN(feePercentage)){

            // Get swap amount,  swapAmount = Amount - fee
            const fee = value *  feePercentage
            const swapAmount = value - fee 
            const swapAmountInWei = web3.utils.toWei(swapAmount.toString(), 'ether')
           
            const url =  `https://api.1inch.exchange/v3.0/1/swap?fromTokenAddress=${fromToken}&toTokenAddress=${toToken}&amount=${swapAmountInWei}&fromAddress=${SENDER_ADDRESS}&slippage=1`
            await axios
            .get(url)
            .then(res => {
                if(res.status === 200){
                    //console.log('API Response:', res.data)
                    if(res.data.toTokenAmount){ 
                        let minReturn = web3.utils.fromWei(res.data.toTokenAmount, 'ether')
                        let bytes = res.data.tx.data  
                        console.log('Fee percentage:', feePercentage)
                        console.log('minReturn: ', minReturn)
                        console.log('pools:', bytes.substr(206))
                    }
                } 
            })
            .catch(e => console.log(e.message)) 
        } 
        
    }catch(e){
        console.log(e)
    }
}


const _fromToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"  // ETH
const _toToken = "0x41C028a4C1F461eBFC3af91619b240004ebAD216"   // TACO
const _value = 0.01 // Swap amount

getData(_fromToken, _toToken, _value)