
/*
  RENA SHOP - EASY EDIT FILE
  --------------------------
  You can change product name, category, price and picture here.
  You can also add new products by copying one product block.

  Picture path example:
  "assets/products/flower-turtle.jpg"

  Category names:
  "Crochet Dolls"
  "Crochet Keychains"
  "Small Purses"
  "Handbags"
  "Hair Accessories"
  "Tops"
  "Clay Animal Keychains"
  "Dolphin Keychains"
  "Flower Designs"
*/

const PRODUCTS = [
  {
    id: "flower-turtle",
    name: "Flower Turtle",
    category: "Clay Animal Keychains",
    price: 149,
    image: "assets/products/flower-turtle.jpg",
    description: "A cute handmade clay flower turtle."
  },

  {
    id: "red-bow",
    name: "Red Bow",
    category: "Hair Accessories",
    price: 69,
    image: "assets/red-bow.jpg",
    description: "Cute handmade crochet bow clips."
  },

  {
    id: "white-bow",
    name: "White Bow",
    category: "Hair Accessories",
    price: 69,
    image: "assets/white bow.jpg",
    emoji: "🎀",
    description: "A cute handmade white bow."
  }
];
const CATEGORIES = [
  "Hair Accessories",
  "Clay Animal Keychains"
];

/*
  EASY BANNER EDIT:
  Change title, text, button and image here.
  If image is empty, the page uses the pastel background.
*/
const HERO_SLIDES = [
  {
    title: "Little Creations, Big Happiness",
    text: "Handmade crochet, clay and bead creations made with love.",
    button: "Shop Now",
    link: "shop.html",
    image: ""
  },
  {
    title: "Made With Love ♡",
    text: "Cute little handmade pieces for gifts, bags and everyday joy.",
    button: "Explore Collection",
    link: "shop.html",
    image: ""
  },
  {
    title: "Your Idea, Made By Rena",
    text: "Ask for a custom colour, design or special handmade creation.",
    button: "Custom Order",
    link: "custom.html",
    image: ""
  }
];

const SITE = {
  email: "renasunzone@gmail.com",
  instagram: "renasun.zone",
  whatsapp: "", // Add your WhatsApp number here later.
  shipping: "Across India",
  paymentText: "UPI / Cards / COD"
};
