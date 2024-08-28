class Book {
  constructor(name, fromLocation, toLocation) {
    // this.id = id;
    this.name = name;
    this.fromLocation = fromLocation;
    this.toLocation = toLocation;
  }
}

function getUserInfo() {
  const info = localStorage.getItem("user");

  if (info == null) {
    return null;
  }

  const parseUserInfo = JSON.parse(info);

  return parseUserInfo;
}

class API {
  constructor() {
    this.URL = "http://localhost:4000";
    this.user = getUserInfo();
  }

  async post(endpoint, data) {
    return fetch(`${this.URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.user.token}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);

        return error;
      });
  }

  async get(endpoint) {
    return fetch(`${this.URL}${endpoint}`)
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);

        return error;
      });
  }
  
  async delete(endpoint) {
    return fetch(`${this.URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.user.token}`,
      },
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);

        return error;
      });
  }
}

class App {
  constructor() {
    this.viewTableElement = document.querySelector("#view-table-body");

    this.user = getUserInfo();
  }

  viewTable() {
    return this.viewTableElement;
  }

  makeEmptyElementValue() {
    const user = this.user;

    if (user != null) {
      document.querySelector(
        "#name"
      ).value = `${user.user.first_name} ${user.user.last_name}`;
    }

    document.querySelector("#toLocation").value = "";
    document.querySelector("#fromLocation").value = "";
    document.querySelector("#fromLocation").removeAttribute("readonly");
    document.querySelector("#submit").value = "Add Book";
    document.querySelector("#submit").setAttribute("data-job", "add");
  }

  async getBookings() {
    const api = new API();
    const allBookings = await api.get("/bookings");

    // Cleanup
    this.viewTable()
      .querySelectorAll("tr")
      .forEach((node) => {
        node.remove();
      });

    allBookings.forEach((data) => {
      const book = new Book(
        data.passenger_name,
        data.from_location,
        `${data.to_location} - ${data.id}`
      );
      this.viewTable().appendChild(this.makeRow(data.id, book));
    });

    return allBookings;
  }

  async formProcess(e) {
    let bookName = document.querySelector("#name").value;
    let bookFromLocation = document.querySelector("#fromLocation").value;
    let bookToLocation = document.querySelector("#toLocation").value;

    // Check if user is logged in
    const user = this.user;

    if (user == null) {
      return alert("Please log in to make a booking");
    }

    if (bookName === "" || bookFromLocation === "" || bookToLocation === "") {
      App.showMessage("Please fill up the form", "error");
    } else {
      // Make API call create
      const api = new API();
      const response = await api.post("/booking", {
        passenger_name: bookName,
        from_location: bookFromLocation,
        to_location: bookToLocation,
      });

      if (response.error) {
        return alert(response.error);
      }

      this.makeEmptyElementValue();

      await this.getBookings();
    }
  }

  addBook(book) {
    if (this.isExists("empty-data")) {
      this.isExists("empty-data", function (element) {
        element.classList.add("testing");
        console.log(element.parent);
      });
    }

    if (!this.isExists(book.toLocation)) {
      this.viewTableElement.appendChild(this.makeRow(book.toLocation, book));
      App.showMessage(`${book.name} book added successfully.`, "success");
    } else {
      App.showMessage(
        `Insertion failed. ${book.name} book already exists.`,
        "error"
      );
    }
  }

  async deleteBook(e) {
    let IsRemoved = false;
    let toLocation = e.getAttribute("data-toLocation");

    const bookingId = toLocation.split('-')[1].trim();


    // Check if user is logged in
    const user = this.user;

    if (user == null) {
      return alert("Please log in to delete a booking");
    }

    if (this.isExists(bookingId)) {
      // Make API call to delete
      const api = new API()

      const response = await api.delete(`/booking/${bookingId}`);

      if (response.error) {
        return alert(response.error)
      }

      IsRemoved = this.isExists(bookingId, function (element) {
        element.remove();
      });
    }

    //clear form values if not empty
    this.makeEmptyElementValue();

    if (IsRemoved) {
      App.showMessage(`Book successfully deleted.`, "success");
    } else {
      //Prevent unexpected error message after successfully deletion specific item.
      if (this.isExists(bookingId)) {
        App.showMessage(`Book deletion failed.`, "error");
      }
    }
  }

  static showMessage(text, type) {
    document.querySelector(".content").innerHTML = text;
    document.querySelector(".message").style = "display:flex;";
    if (type !== undefined) {
      document.querySelector(
        ".message"
      ).className = `message border-radius-5px box-shadow-default ${type}`;
    }

    setTimeout(function () {
      document.querySelector(".content").innerHTML = "";
      document.querySelector(".message").style = "display:none;";
    }, 2500);
  }

  distributeBookData(parentElement, book, rowNumber = 0) {
    parentElement.childNodes.forEach(function (childElement, indexNumber) {
      if (indexNumber === 0) {
        //add row serial number, when row number has been provide
        //default value set 0
        if (rowNumber !== 0) {
          childElement.innerText = rowNumber;
        }
      }
      if (indexNumber === 1) {
        childElement.innerText = book.name;
      }
      if (indexNumber === 2) {
        childElement.innerText = book.fromLocation;
      }
      if (indexNumber === 3) {
        childElement.innerText = book.toLocation;
      }
      if (indexNumber === 4) {
        //add name, fromLocation and toLocation for edit button
        childElement.firstChild.setAttribute("data-name", book.name);
        childElement.firstChild.setAttribute(
          "data-fromLocation",
          book.fromLocation
        );
        childElement.firstChild.setAttribute(
          "data-toLocation",
          book.toLocation
        );

        //add toLocation for delete button
        childElement.lastChild.setAttribute("data-toLocation", book.toLocation);
      }
    });
  }

  isExists(identifier, callback) {
    let IsFound = false;
    this.viewTableElement.childNodes.forEach(function (element) {
      if (element.nodeName === "TR") {
        if (element.getAttribute("id") === identifier) {
          if (callback) {
            callback(element);
          }
          IsFound = true;
        }
      }
    });

    return IsFound;
  }

  makeRow(rowId, book) {
    let tr = document.createElement("tr");
    tr.setAttribute("id", rowId);
    if (book) {
      let curElNumber = this.viewTableElement.childElementCount + 1;
      tr.innerHTML = `<td>${curElNumber.toString()}</td><td>${
        book.name
      }</td><td>${book.fromLocation}</td><td>${
        book.toLocation
      }</td><td><button class="background-image box-shadow-dark" id="delete" data-id="${
        book.id
      }" data-toLocation="${book.toLocation}">Delete</button></td>`;
    } else {
      let td = document.createElement("td");
      td.setAttribute("colspan", "5");
      td.innerText = "No data exists";
      tr.appendChild(td);
    }
    return tr;
  }
}
