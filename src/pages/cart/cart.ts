import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { CheckoutPage } from '../checkout/checkout';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage {

  cartItems: any[] = [];
  total: any;
  showEmptyCartMessage: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, 
    public viewCtrl: ViewController, public toastCtrl: ToastController) {

    this.total = 0.0;
  
    this.storage.ready().then(()=>{
      this.storage.get("cart").then((data)=>{
        this.cartItems = data;
        console.log(this.cartItems);

        if(this.cartItems.length > 0){
          this.cartItems.forEach((item, index) => {

            if(item.variation){
              this.total = this.total + (parseFloat(item.variation.price)* item.qty);
            } else{
              this.total = this.total + (item.product.price * item.qty)
            }
            
          })
        } else {
          this.showEmptyCartMessage = true;
        }
      })
    })
  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CartPage');
  }

  removeFromCart(item, i){

    let price;
    
    if(item.variation){
      price = item.variation.price;
    } else {
      price = item.product.price;
    }
    
    let qty = item.qty;

    this.cartItems.splice(i,1);
    this.storage.set("cart", this.cartItems).then( ()=>{
      this.total = this.total - (price * qty);
    });

    if(this.cartItems.length == 0){
      this.showEmptyCartMessage = true;
    }

  }

  closeModal(){
    this.viewCtrl.dismiss();
  }

  checkout(){
    this.storage.get("userLoginInfo").then((data)=>{
      if(data != null){
        this.navCtrl.push(CheckoutPage);
      } else {
        this.navCtrl.push(LoginPage, {next: CheckoutPage});
      }
    });
  }

  changeQty(item, i, change){
    
    let price;

    if (!item.variation){
      price = item.product.price;
    } else {
      price = parseFloat(item.variation.price);
    }

    let qty = item.qty;

    if(change < 0 && item.qty == 1){
      return;
    }

    qty = qty + change;
    item.qty = qty;
    item.amount = qty * price;
    item.price = price;

    this.cartItems[i] = item;

    this.storage.set("cart", this.cartItems).then(()=>{

      if(change > 0){
        this.total = this.total + item.price;
      } else {
        this.total = this.total - item.price;
      }

      this.toastCtrl.create({
        message: "Cart Updated.",
        duration: 2000,
        showCloseButton: true
      }).present();
    })


  }

}
