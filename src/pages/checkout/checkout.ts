import { Component } from '@angular/core';
import { NavController, NavParams, AlertController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { WoocommerceProvider } from '../../providers/woocommerce/woocommerce';

@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html',
})
export class CheckoutPage {

  WooCommerce: any;
  newOrder: any;
  paymentMethods: any[];
  paymentMethod: any;
  billing_shipping_same: boolean;
  userInfo: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public storage: Storage, public alertCtrl: AlertController, private WP: WoocommerceProvider) {
  
    this.newOrder = {};
    this.newOrder.billing = {};
    this.newOrder.shipping = {};
    this.billing_shipping_same = false;
    

    this.paymentMethods = [
      {method_id: "bacs", method_title: "Direct Bank Transfer"},
      {method_id: "cheque", method_title: "Cheque"},
      {method_id: "cod", method_title: "Cash on Delivery"},
      {method_id: "paypal", method_title: "Paypal"}
    ];

    this.WooCommerce = WP.init(true);

    this.storage.get("userLoginInfo").then((userLoginInfo)=>{
      this.userInfo = userLoginInfo.user;

      let email = userLoginInfo.user.email;
      let id = userLoginInfo.user.id;

      this.WooCommerce.getAsync("customers/"+id).then((data) => {
      
        this.newOrder = JSON.parse(data.body);

      })
    })

  }

  setBillingShippingSame() {
    this.billing_shipping_same = !this.billing_shipping_same;

    if (this.billing_shipping_same) {
      this.newOrder.shipping = this.newOrder.billing;
    }

  }

  placeOrder() {

    let orderItems: any[] = [];
    let data: any = {};

    let paymentData: any = {};

    this.paymentMethods.forEach((element, index) => {
      if (element.method_id == this.paymentMethod) {
        paymentData = element;
      }
    });


    data = {
      payment_method: paymentData.method_id,
      payment_method_title: paymentData.method_title,
      billing: this.newOrder.billing,
      shipping: this.newOrder.shipping,
      customer_id: this.userInfo.id || '',
      line_items: orderItems,
      status: "processing"
    };


    if (paymentData.method_id == "paypal") {

    } else {

      this.storage.get("cart").then((cart) => {

        cart.forEach((element, index) => {
          if(element.variation){
            orderItems.push({ product_id: element.product.id, variation_id: element.variation.id, quantity: element.qty });
            ///total = total + (element.variation.price * element.qty);
          } else {
            orderItems.push({ product_id: element.product.id, quantity: element.qty });
            ///total = total + (element.product.price * element.qty);
          }
        });

        data.line_items = orderItems;

        let orderData: any = {};

        orderData.order = data;

        this.WooCommerce.postAsync("orders", orderData.order).then((data) => {

          let response = (JSON.parse(data.body));

          this.alertCtrl.create({
            title: "Order Placed Successfully",
            message: "Your order has been placed successfully. Your order number is " + response.number,
            buttons: [{
              text: "OK",
              handler: () => {
                this.navCtrl.setRoot(HomePage);
              }
            }]
          }).present();

          data = [];
          this.storage.set("cart", data);

        })

      })

    }

  }


  
}
