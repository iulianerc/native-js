class Product {
  constructor({id, name, price, unit, maxCount}) {
    this.id = id
    this.name = name
    this.price = price
    this.unit = unit
    this.maxCount = maxCount
  }
  
  getId() {
    return this.id
  }
  
  getName() {
    return this.name
  }
  
  getPrice() {
    return this.price
  }
  
  getUnit() {
    return this.unit
  }
  
  getMaxCount() {
    return this.maxCount
  }
  
  setCount(count = 1) {
    this.count = count
  }
  
  getCount() {
    return this.count
  }
}

class ProductDAO {
  constructor() {
    this.products = []
  }
  
  addProduct(product) {
    this.products.push(new Product(product))
  }
  // toDO de redescris in find index
  deleteProduct(id) {
   const index = this.products.findIndex(el => el.getId() === id)
    this.products.splice(index, 1)
  }
  
  getProducts() {
    return this.products
  }
}

class ShopCartDAO {
  constructor() {
    this.shopCartList = []
  }
  
  addToCart(product) {
    this.shopCartList.push(product)
  }
  deleteProduct(id) {
    const index = this.shopCartList.findIndex(el => el.getId() === id)
    this.shopCartList.splice(index, 1)
  }
  getShopList() {
    return this.shopCartList
  }
  
  changeShopProduct(id) {
    this.shopCartList.forEach((el, index) => {
      if (el.id === id) this.shopCartList[index].setCount(this.shopCartList[index].getCount() + 1)
    })
  }
  
  computePrice(count, price) {
    return count * price
  }
  
  computeTotalPrice() {
    return this.shopCartList.reduce((total,el) => total + el.getCount() * el.getPrice(), 0)
  }
}

const products = new ProductDAO()
const shopList = new ShopCartDAO()

const request = async (url) => {
  const response = await fetch(url, {
    method: "GET"
  });
  return response.json();
}
const createProductsObject = async () => {
  const jsonData = await request("http://localhost:3000/products")
  jsonData.forEach(product => {
    products.addProduct(product)
  })
}

const showProducts = () => {
  const productsBlock = document.getElementById("products")
  const productsItemDemoBlock = document.getElementById("products_item__demo")
  productsBlock.innerHTML = ""
  products.getProducts().forEach((el) => {
    const productsItem = productsItemDemoBlock.cloneNode(true)
    productsItem.removeAttribute("id")
    productsItem.innerHTML = productsItem.innerHTML.replace("{{name}}", el.getName())
    productsItem.innerHTML = productsItem.innerHTML.replace("{{price}}", el.getPrice())
    productsItem.innerHTML = productsItem.innerHTML.replace("{{unit}}", el.getUnit())
    for (const child of productsItem.children) {
      if (child.className === "addToCart") {
        child.addEventListener('click', () => {
          addToShopList(el)
          showShopList()
        })
      }
      if (child.className === "deleteProduct") {
        deleteProduct(child, el)
      }
    }
    productsBlock.append(productsItem)
  })
}
const addToShopList = (el) => {
  if (el.getCount()) {
    shopList.changeShopProduct(el.getId())
  } else {
    el.setCount()
    shopList.addToCart(el)
  }
}
const deleteProduct = (deleteProduct, product) => {
  deleteProduct.addEventListener("click", async () => {
    await fetch(`http://localhost:3000/products/${product.getId()}`, {
      method: 'DELETE'
    })
    document.getElementById("products").innerHTML = ""
    products.deleteProduct(product.getId())
    shopList.deleteProduct(product.getId())
    showProducts()
    showShopList()
  })
}
const addProduct = () => {
  const addProductButton = document.getElementById("addProduct")
  const addFormBlock = addProductButton.nextElementSibling
  const addFormButton = document.getElementById("addProduct_form__button")
  
  addProductButton.addEventListener("click", () => {
    addProductButton.parentElement.classList.add("addProduct__active")
    addProductButton.hidden = true
    addFormBlock.hidden = false
  })
  addFormButton.addEventListener("click", async () => {
    const product = {}
    for (const child of addFormBlock.children) {
      if (child.tagName === "INPUT") {
        product[child.getAttribute("name")] = child.value
      }
    }
    product.id = products.getProducts()[products.getProducts().length - 1].getId() + 1
    
    products.addProduct(product)
    await fetch("http://localhost:3000/products", {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(product)
    })
    addProductButton.parentElement.classList.remove("addProduct__active")
    addProductButton.hidden = false
    addFormBlock.hidden = true
    showProducts()
  })
}

const showShopList = () => {
  const shopListBlock = document.getElementById("shopListBlock")
  const shopListItemDemoBlock = document.getElementById("shopList_item__demo")
  shopListBlock.innerHTML = ""
  shopList.getShopList().forEach((el, index) => {
    const shopListItem = shopListItemDemoBlock.cloneNode(true)
    shopListItem.removeAttribute("id")
    shopListItem.innerHTML = shopListItem.innerHTML.replace("{{name}}", el.getName())
    shopListItem.innerHTML = shopListItem.innerHTML.replace("{{price}}", el.getPrice())
    shopListItem.innerHTML = shopListItem.innerHTML.replace("{{unit}}", el.getUnit())
    shopListItem.innerHTML = shopListItem.innerHTML.replace("{{maxCount}}", el.getMaxCount())
    shopListItem.innerHTML = shopListItem.innerHTML.replace("{{count}}", el.getCount())
    shopListItem.innerHTML = shopListItem.innerHTML.replace("{{unitPrice}}", shopList.computePrice(el.getCount(), el.getPrice()))
    document.getElementById("totalPrice").innerText = "Total price : " + shopList.computeTotalPrice();
    
    const inputTag = shopListItem.children[2].firstElementChild
    inputTag.addEventListener("focusout", () => {
      shopList.getShopList()[index].setCount(+inputTag.value)
      shopListItem.innerHTML = shopListItem.innerHTML.replace("{{unitPrice}}", shopList.computePrice(el.getCount(), el.getPrice()))
      document.getElementById("totalPrice").innerText = shopList.computeTotalPrice();
      showShopList()
    })
    
    shopListBlock.append(shopListItem)
    shopListBlock.append(document.createElement("br"))
  })
}

const search = () => {
  const search = document.getElementById('search')
  search.addEventListener('input', () => {
    products.getProducts().forEach(( product, index ) => {
      const searchValue = product.getName().search(/[search.value]/i)
      if ( searchValue !== -1 ){
        console.log(index)
      }
    })
  })
}

const main = async () => {
  await createProductsObject()
  showProducts()
  showShopList()
  addProduct()
  search()
}

main()
