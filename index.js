/**
 * Represents a single musical instrument in the store.
 */
class Product {
    constructor(name, imagePath, rating, releaseDate) {
        this.name = name;
        this.imagePath = imagePath;
        this.rating = parseInt(rating); // Ensure the rating is a number for math operations
        this.releaseDate = releaseDate;
    }
}

// Configuration constants
const NEW_ARRIVAL_MONTHS_THRESHOLD = 6;    
const POPULAR_RATING_THRESHOLD = 3;
const MS_IN_MONTH = 1000 * 60 * 60 * 24 * 30; // Milliseconds in a month (approximate)

/**
 * Fetches XML data from the server.
 */
function fetchProductData(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'products.xml', true); 
    
    xhr.onreadystatechange = function() {
        // State 4 means request is complete, Status 200 means success
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(xhr.responseXML);
        }
    };
    xhr.send();
}

/**
 * Parses XML data and converts it into an array of Product objects.
 */
function parseXmlToProducts(xml) {
    const itemsXML = xml.getElementsByTagName("item");
    const productsList = [];

    for (let item of itemsXML) {
        // Extracting text content from XML tags
        const imagePath = item.querySelector("img").textContent;
        const name = item.querySelector("name").textContent;
        const rating = item.querySelector("grade").textContent;
        const releaseDate = item.querySelector("date").textContent;
        
        // Creating a new instance and adding it to our list
        const productInstance = new Product(name, imagePath, rating, releaseDate);        
        productsList.push(productInstance);
    }
    
    distributeProductsToSections(productsList);
}

/**
 * Filters products and renders them into the appropriate HTML sections.
 */
function distributeProductsToSections(products) {
    const popularContainer = document.querySelector(".top-products");
    const newArrivalsContainer = document.querySelector(".new-products");

    products.forEach(product => {
        // Create the base HTML element for the product
        const productCard = createProductUIElement(product);
    
        // Logic for "Popular" section based on rating
        if (product.rating > POPULAR_RATING_THRESHOLD) {
            popularContainer.appendChild(productCard.cloneNode(true));
        }

        // Logic for "New" section based on date
        const releaseTimeMs = new Date(product.releaseDate).getTime();
        const currentTimeMs = Date.now();
        const timeDifferenceMs = currentTimeMs - releaseTimeMs;

        // Check if the product was released within the last X months
        if (timeDifferenceMs < (NEW_ARRIVAL_MONTHS_THRESHOLD * MS_IN_MONTH)) {
            newArrivalsContainer.appendChild(productCard.cloneNode(true));
        }
    });
}

/**
 * Generates the HTML structure (DOM node) for a product card.
 */
function createProductUIElement(product) {
    // 1. Create the main wrapper
    const productCard = document.createElement('div');
    productCard.className = 'product';

    // 2. Add the Product Image
    const imgElement = document.createElement('img');
    imgElement.src = product.imagePath;
    imgElement.alt = product.name;

    // 3. Add the Product Name
    const nameLabel = document.createElement('span');
    nameLabel.textContent = product.name;

    // 4. Create the Star Rating
    // Generates a string like "★★★★☆" based on the rating value
    const ratingLineBreak = document.createElement('br');
    const starsContainer = document.createElement('span');
    starsContainer.className = 'stars';
    starsContainer.textContent = "★".repeat(product.rating) + "☆".repeat(5 - product.rating);

    // 5. Assemble all parts into the card
    productCard.append(imgElement, nameLabel, ratingLineBreak, starsContainer);

    return productCard;
}

// Entry point: Start the process by fetching the XML
fetchProductData(parseXmlToProducts);