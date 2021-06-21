const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://Aman_1226:Aman_1226@cluster0.e9jtf.mongodb.net/detailDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

const customerSchema = new mongoose.Schema({
    name: "String",
    email: "String",
    balance: "Number"
});

const Customer = mongoose.model("customer", customerSchema);

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/Project.html");
});

app.get("/customers", function (req, res) {
    Customer.find(function (err, customers) {
        res.render("index", { customerList: customers });
    });
});

app.post("/", function(req, res){

    Customer.findById(req.body.viewDetails, function(err, customer){
        res.render("details", {customerDetail: customer});
    });
});

app.post("/transfer", function(req, res){
    const sender = req.body.transfer;

    Customer.find(function(err, customerList){
        const receiversId = customerList.filter(function(element){
            return element._id != sender;
        });

        Customer.findById(sender, function(err, senderCustomer){
            res.render("transfer", {senderDetails: senderCustomer, recieverList: receiversId});
        });
    });
});

app.post("/finalTransfer", (req, res) => {

    const amountToBeDeducted = Number(req.body.amount);
    const sendersId = req.body.senderId;
    const recieversId = req.body.reciever;
        
    Customer.findById(sendersId, function(err, sender){
        if(err)
        {
            console.log(err);
            
        }
        else
        {
            const sendersBalance = sender.balance;
            const remainingSendersBalance = Number(sendersBalance) - Number(amountToBeDeducted);
            
            if(remainingSendersBalance>=0)
            {
                Customer.findById(recieversId, function(err, reciever){
                    const recieversBalance = reciever.balance;
                    const totalRecieversBalance = Number(recieversBalance) + Number(amountToBeDeducted)
                        Customer.findByIdAndUpdate(recieversId,{balance:totalRecieversBalance}, function(err){
                            if(err)
                            {
                                console.log(err);
                                
                            }
                           
                        });
                    
                });
                Customer.findByIdAndUpdate(sendersId,{balance:remainingSendersBalance},function(err){
                    if(err)
                    {
                        console.log(err);
                        
                    }
                });
               
               res.render("success",{contentResult:"Transfer Successful !"});
                
                
            }
            else
            {
                res.render("failure",{contentResult:"Transfer Failed \n Due To Insufficient Balance !"});
            }
            
        }
        
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server is Running");
});