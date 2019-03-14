/* 
- Oublie pas que le code JavaScript est visible par tous le monde comme le code HTML.

- Dès que tu vois un $("blabla") c'est du JQuery à la place de blabla tu dois mettre un sélecteur css, je te laisse te renseigner sur G.
- Dans un sélecteur css "." le point est égal à class.
- Dans un sélecteur css "#" le dièse est égal à l'ID.


*/

var Orders_Table = [];
var Orders_Track_Table = [];
var Customers_Table = [];
var Providers_Table = [];

var Last_Month_String = []; // Contient les trois derniers mois en string "Février 2019"
var Last_Month_Int = []; // Contient les trois derniers mois en int "2019-02"

var Next_State = ["Envoi fournisseur",  "Réception transitaire", "Contrôle vétérinaire", "Passage douane", "Remise transporteur", "En transit camion", "Arrivée client"];
var Current_State = ["En cours", "Erreur", "Fini"];

var Count_Orders_1 = 0;
var Count_Orders_2 = 0;
var Count_Orders_3 = 0;

var Count_Error_Orders_1 = 0.00;
var Count_Error_Orders_2 = 0.00;
var Count_Error_Orders_3 = 0.00;

var Wrapper_Active = "";

// Les fonctions ci-dessous sont là pour récupérer le contenu de la bdd via avec des requêtes AJAX

function Reload_Orders_SQL() { // Cette fonction permet d'actualiser la tableau Orders_Table avec les données de la base de données
    $.post("./js/process.php", {
        async: false,
        AJAX_ID: 1,
        AJAX_DATA: "Null"
    },
    function(callback) {
        if(callback != "Failed !") {
            Orders_Table = JSON.parse(callback);
        }
    });
}

function Reload_Orders_Track_SQL() { // Cette fonction permet d'actualiser la tableau Orders_Table avec les données de la base de données
    $.post("./js/process.php", {
        async: false,
        AJAX_ID: 2,
        AJAX_DATA: "Null"
    },
    function(callback) {
        if(callback != "Failed !") {
            Orders_Track_Table = JSON.parse(callback);
        }
    });
}

function Reload_Customers_SQL() { // Cette fonction permet d'actualiser la tableau Customers_Table avec les données de la base de données
    $.post("./js/process.php", {
        async: false,
        AJAX_ID: 3,
        AJAX_DATA: "Null"
    },
    function(callback) {
        if(callback != "Failed !") {
            Customers_Table = JSON.parse(callback);
        }
    });
}

function Reload_Providers_SQL() { // Cette fonction permet d'actualiser la tableau Providers_Table avec les données de la base de données
    $.post("./js/process.php", {
        async: false,
        AJAX_ID: 4,
        AJAX_DATA: "Null"
    },
    function(callback) {
        if(callback != "Failed !") {
            Providers_Table = JSON.parse(callback);
        }
    });
}

function Delete_Order_Array(LTA_ID) { // Cette fonction permet supprimer du tableau la ligne qui possède le numéro LTA_ID en paramètre
    for(var i = 0; i < Orders_Table.length; i++) {
        if(Orders_Table[i]["LTA_ID"] == LTA_ID) {
           Orders_Table = Orders_Table.slice(0, i).concat(Orders_Table.slice(i + 1, Orders_Table.length));
        }
    }
    for(var i = 0; i < Orders_Track_Table.length; i++) {
        if(Orders_Track_Table[i]["LTA_ID"] == LTA_ID) {
           Orders_Track_Table = Orders_Track_Table.slice(0, i).concat(Orders_Track_Table.slice(i + 1, Orders_Track_Table.length));
        }
    }
}

function Delete_Order_SQL(LTA_ID) { // Cette fonction permet de supprimer une commande dans la bdd via une requête AJAX avec son numéro LTA
    $.post("./js/process.php", {
        async: false,
        AJAX_ID: 5,
        AJAX_DATA: LTA_ID
    },
    function(callback) {
        if(callback != "Failed !") {
            Delete_Order_Array(LTA_ID);
            Refresh_Delete_Order();
            Send_Notification('<i class="fas fa-check"></i>La commande a été supprimée !')
        }
        else {
            Send_Notification('<i class="fas fa-times" style="color:red!important"></i>Erreur, veuillez réessayer.')
        }
    });
}

function Add_New_Order(Customer, Provider, Description, Date_Delivery) {
    $.post("./js/process.php", {
        async: false,
        AJAX_ID: 6,
        AJAX_DATA: {
            "Customer": Customer,
            "Provider": Provider,
            "Description": Description,
            "Date_Delivery": Date_Delivery
        }
    },
    function(callback) {
        if(callback != "Failed !") {
            Refresh_Delete_Order();
            Send_Notification('<i class="fas fa-check"></i>Nouvelle commande créée !')
        }
        else {
            Send_Notification('<i class="fas fa-times" style="color:red!important"></i>Erreur, veuillez réessayer.')
        }
    });
}

function Get_Order_By_LTA_ID(LTA_ID) {
    var temp = [];
    for(var i = 0; i < Orders_Table.length; i++) {
        if(Orders_Table[i]["LTA_ID"] == LTA_ID) {
            temp = Orders_Table[i];
        }
    }
    return temp;
}

function Get_Current_Order(array) {
    var temp = [];
    for(var i = 0; i < array.length; i++) {
        if(array[i]["Current_State"] == "En cours") {
            temp.push(array[i]); // Insert Orders_Table[i] dans le tableau temp
        }
        else if(array[i]["Current_State"] == "Erreur") {
            temp.push(array[i]); // Insert Orders_Table[i] dans le tableau temp
        }
    }
    temp.sort((a, b) => Convert_Date_Timestamp(a.Date_Purchase) +  Convert_Date_Timestamp(b.Date_Purchase));
    return temp;
}

function Get_Archive_Order(array) { // Récupère la commande en suivant le suivi du colis
    var temp = [];
    for(var i = 0; i < array.length; i++) {
        if(array[i]["Current_State"] == "Fini") {
            temp.push(array[i]); // Insert Orders_Table[i] dans le tableau temp
        }
    }
    return temp;
}

function Get_Track_Array_By_LTA_ID(LTA_ID) {
    var temp = [];
    last_state = 0;
    for(var i = 0; i < Orders_Track_Table.length; i++) {
        if(Orders_Track_Table[i]["LTA_ID"] == LTA_ID) {
            temp.push(Orders_Track_Table[i]);
        }
    }
    temp.sort((a, b) => parseFloat(a.Next_State) - parseFloat(b.Next_State));
    return temp;
}

function Get_Current_State_Track(array) {
    var temp = [];
    var current_i = 0;
    if(array.length > 1) {
        for(var i = 0; i < array.length; i++) {
            if(array[i]["Next_State"] > current_i) {
                temp = array[i];
                current_i = array[i]["Next_State"];
            }
        }
    }
    else {
        temp = array[0];
    }
    return temp;
}

function Check_LTA_ID(LTA_ID) { // Vérifie si le LTA_ID existe dans le tableau Orders_Table
    for(var i = 0; i < Orders_Table.length; i++) {
        if(Orders_Table[i]["LTA_ID"] == LTA_ID) {
            return true;
        }
    }
    return false;
}

function Transform_State_To_String(int) {
    return Next_State[int];
}

function Convert_Date_Timestamp(date) { // Convertie une date en string "2019-02-21" en timestamp pour pouvoir la comparer à une autre
    var temp = Date.parse(date);
    return Math.round(temp/1000);
}


//////////////////////////////////////////////////////////////////////////// -> DASHBOARD VIEW <- ////////////////////////////////////////////////////////////////////////////



function Check_Search_Orders(LTA_ID) {
    if(LTA_ID != "" && LTA_ID != " ") {
        if(LTA_ID.length == 8) {
            if(Check_LTA_ID(LTA_ID)) {
                $("#Search_Input").val(""); // Supprime la valeur dans l'input #Search_Input
                return true;
            }
            else {
                Send_Notification('<i class="fas fa-times" style="color:red!important"></i>Vérifier votre numéro LTA.');
            }
        }
    }
    else {
        Send_Notification('<i class="fas fa-times" style="color:red!important"></i>Vérifier votre numéro LTA.');
    }
}

function Transform_Date(date) { // Supprime ce qu'il y a après l'espace dans la date (Heure, minute, seconde) -> 2019-02-27 00:00:00
    return date.split(" ")[0];
}

function Transform_State(State) { // Retourne la valeur numérique de Next_State en string.
    return Next_State[State];
}

function Fill_Last_Month() { // Récupère les trois derniers mois et les transformes comme dit dans le cahier des charges
    for(var i = 0; i < 3; i++) {
        var String_Date = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        var date = new Date();
        var temp = date.getMonth() - i;
        if(temp >= 0) {
            var month = date.getMonth() - i;
            var Month_String = String_Date[parseInt(month)];
            var years = date.getFullYear(); 
            var Num_Month = parseInt(month)+1;
            if(Num_Month < 10) {
                Last_Month_Int[i] = years + "-0" + Num_Month;
            }
            else {
                Last_Month_Int[i] = years + "-" + Num_Month;
            }
            Last_Month_String[i] = Month_String + " " + years;
        }
        else {
            var month = 12 - Math.abs(temp);
            var Month_String = String_Date[parseInt(month)];
            var years = date.getFullYear()-1;
            var Num_Month = parseInt(month)+1;
            if(Num_Month < 10) {
                Last_Month_Int[i] = years + "-0" + Num_Month;
            }
            else {
                Last_Month_Int[i] = years + "-" + Num_Month;
            }
            Last_Month_String[i] = Month_String + " " + years;
        }
    }
}

function Check_Date_SQL(array) { // Compte le nombre de commande et le nombre d'erreur des trois derniers mois
    var temp = [];
    for(var i = 0; i < array.length; i++) {
        var target = array[i]["Date_Purchase"];
        if(!temp.includes(target)) {
            var regex = target.match(/^20..-../);
            var Date_Time = regex[0];
            if(Date_Time == Last_Month_Int[0]) {
                Count_Orders_1++;
                if(array[i]["Current_State"] == "Erreur") {
                    Count_Error_Orders_1++;
                }
            }
            else if(Date_Time == Last_Month_Int[1]) {
                Count_Orders_2++;
                if(array[i]["Current_State"] == "Erreur") {
                    Count_Error_Orders_2++;
                }
            }
            else if(Date_Time == Last_Month_Int[2]) {
                Count_Orders_3++;
                if(array[i]["Current_State"] == "Erreur") {
                    Count_Error_Orders_3++;
                }
            }
            temp.push(target);
        }
    }
    delete temp;
}

function Refresh_Delete_Order() {
    Last_Month_String = [];
    Last_Month_Int = [];
    Count_Orders_1 = 0;
    Count_Orders_2 = 0;
    Count_Orders_3 = 0;
    Count_Error_Orders_1 = 0.00;
    Count_Error_Orders_2 = 0.00;
    Count_Error_Orders_3 = 0.00;
    Reload_Orders_SQL(); 
    Reload_Orders_Track_SQL();
    setTimeout(function() {
        Fill_Last_Month();
        Check_Date_SQL(Orders_Table);
        Set_New_Order(Get_Current_Order(Orders_Table), Get_Archive_Order(Orders_Table));
        for(var i = 0; i < Orders_Table.length; i++) {
            if(Wrapper_Active == Orders_Table[i]["Customer"]) {
                var Customer_Name = Wrapper_Active;
                var Customer_Order = Get_Order_Customer(Customer_Name);
                Set_Track_Customer(Get_Customer(Customer_Name), Get_Current_Order(Customer_Order), Get_Archive_Order(Customer_Order));
            }
            else if(Wrapper_Active == Orders_Table[i]["Provider"]) {
                var Provider_Name = Wrapper_Active;
                var Provider_Order = Get_Order_Provider(Provider_Name);
                Set_Track_Provider(Get_Provider(Provider_Name), Get_Current_Order(Provider_Order), Get_Archive_Order(Provider_Order));
            }
        }
    }, 500);
}

function Set_New_Order(array_1, array_2) { // Affiche le contenu de la bdd dans les tableaux
    $("#Dashboard_Wrapper .Delete_Table").remove("*"); // Supprime le contenu des tableaux html
    array_1.forEach(function(value) { // Un boucle foreach classique (Un boucle qui parcours le tableau)
        var Track_Array = Get_Current_State_Track(Get_Track_Array_By_LTA_ID(value["LTA_ID"]));
        //$("#Current_Orders table") ceci est un selecteur css, là je suis entrain de target la balise "table" à l'intérieur d'une balise de classe "Current_Orders"
        //.append() ceci est une fonction qui permet d'injecter du code html, donc je suis entrain d'injecter le code html ci-dessous dans le selecteur ci_dessus 
        $("#Current_Orders table").append(` 
            <tr class="Delete_Table" id="Delete_Table_Filter">
                <td>` + value["LTA_ID"] + `</td>
                <td class="Customer_Order">` + value["Customer"] + `</td>
                <td class="Provider_Order">` + value["Provider"] + `</td>
                <td>` + Transform_Date(value["Date_Purchase"]) + `</td>
                <td>` + Transform_Date(value["Delivery"]) + `</td>
                <td>` + Transform_State_To_String(Track_Array["Next_State"]) + `</td>
                <td>` + value["Current_State"] + `</td>
                <td>
                    <button class="Current_Orders_Display" data-target="` + value["LTA_ID"] + `" data-state="` + Track_Array["Next_State"] + `"><i class="fas fa-eye"></i></button>
                    <button class="Current_Orders_Delete" data-target="` + value["LTA_ID"] + `"><i class="far fa-trash-alt"></i></button>
                </td>
            </tr>
        `);
    });
    $(".Title_Current p").text("Commande en cours (" + array_1.length + ")"); // Change le texte de la balise p avec la classe "Title_Current" avec le nombre actuel de commande

    // ARCHIVES
    array_2.forEach(function(value) {
        var Error_State = "Non"
        if(value["Current_State"] == "Erreur") { // Vérifie si le paramètre "Current_State" est égal à "Erreur" à chaque itération 
            Error_State = "Oui"; // Si oui affiche oui dans le tableau archives
        }
        var Track_Array = Get_Current_State_Track(Get_Track_Array_By_LTA_ID(value["LTA_ID"]));
        $("#Archive_Orders table").append(`
            <tr class="Delete_Table">
                <td>` + value["LTA_ID"] + `</td>
                <td class="Customer_Order">` + value["Customer"] + `</td>
                <td class="Provider_Order">` + value["Provider"] + `</td>
                <td>` + Transform_Date(value["Date_Purchase"]) + `</td>
                <td>` + Transform_Date(Track_Array["Date_State"]) + `</td>
                <td>` + Transform_Date(value["Delivery"]) + `</td>
                <td>` + Error_State + `</td>
                <td>
                    <button class="Current_Orders_Display" data-target="` + value["LTA_ID"] + `" data-state="` + value["Next_State"] + `"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `);
    });

    // Stats Left
    $(".Left_Stat table").append(`
        <tr class="Delete_Table">
            <th>` + Last_Month_String[0] + `</th>
            <th>` + Last_Month_String[1] + `</th>
            <th>` + Last_Month_String[2] + `</th>
        </tr>
        <tr class="Delete_Table">
            <td>` + Count_Orders_1 + `</td>
            <td>` + Count_Orders_2 + `</td>
            <td>` + Count_Orders_3 + `</td>
        </tr>
    `);

    // Stats Right
    var temp_1 = Count_Error_Orders_1 * 100 / Count_Orders_1.toFixed(2) || 0; // Pourcentage d'erreur sur le mois actuel ou si null 0%
    var temp_2 = Count_Error_Orders_2 * 100 / Count_Orders_2.toFixed(2) || 0; // Pourcentage d'erreur sur le mois -1 ou si null 0%
    var temp_3 = Count_Error_Orders_3 * 100 / Count_Orders_3.toFixed(2) || 0; // Pourcentage d'erreur sur le mois -2 ou si null 0%
    $(".Right_Stat table").append(`
        <tr class="Delete_Table">
            <th>` + Last_Month_String[0] + `</th>
            <th>` + Last_Month_String[1] + `</th>
            <th>` + Last_Month_String[2] + `</th>
        </tr>
        <tr class="Delete_Table">
            <td>` + temp_1.toString() + ` %</td>
            <td>` + temp_2.toString() + ` %</td>
            <td>` + temp_3.toString() + ` %</td>
        </tr>
    `);
}

//////////////////////////////////////////////////////////////////////////// -> ORDER VIEW <- ////////////////////////////////////////////////////////////////////////////

// CODE ORDER

function Transform_Attachment(Path) { // Supprime le chemin relatif du fichier -> ./file/index.pdf -> index.pdf
    return Path.split("/file/")[1];
}

function Set_Track_Order(array_1, Track_Array) { // Injecte du code html pour la page commande
    $(".Delete_Title_Order").remove("*"); // Supprime le contenu des tableaux html
    $(".Content_History >").remove("*"); // Supprime le contenu des tableaux html

    $(".Delete_Title_History").remove("*"); // Supprime le contenu des tableaux html
    $(".Delete_History").remove("*"); // Supprime le contenu des tableaux html

    $(".Title_History").append(`
        <p class="Delete_Title_Order">Commande ` + array_1["LTA_ID"] + `</p>
    `);
    
    var Date_Current_State = Get_Current_State_Track(Track_Array);

    $(".Content_History").append(`
        <p>Nom du client : ` + array_1["Customer"] + `</p>
        <p>Nom du fournisseur : ` + array_1["Provider"] + `</p>
        <p>Date de passation de la commande : ` + Transform_Date(array_1["Date_Purchase"]) + `</p>
        <p>Date de livraison prévue : ` + Transform_Date(array_1["Delivery"]) + `</p>
        <p>Contenu de la commande : Merlan 12 Kg</p>
        <p>Étape actuelle de la commande : ` + array_1["Current_State"] + `</p>
        <p>Étape de l'état : ` + Transform_State_To_String(Date_Current_State["Next_State"]) + `</p>
        <p>Depuis le : ` + Transform_Date(Date_Current_State["Date_State"]) + `</p>
        <p>Commentaire : ` + array_1["Description"] + `</p>
    `);

    if(array_1["Attachment"] == "Aucune pièce jointe") {
        $(".Content_History").append(`
            <p>
                Pièce jointe : Aucune pièce jointe
            </p>
        `);
    }
    else {
        $(".Content_History").append(`
            <p>
                Pièce jointe : ` + Transform_Attachment(array_1["Attachment"]) + `
                <button class="Attachment_Button" data-file="` + array_1["Attachment"] + `">Afficher</button>
            </p>
        `);
    }

    $(".Title_Orders").append(`<p class="Delete_Title_History">Historique de la commande ` + array_1["LTA_ID"] + `</p>`);

    Track_Array.forEach(function(value) {
        $("#History_Orders table").append(`
            <tr class="Delete_History">
                <td>` + value["LTA_ID"] + `</td>
                <td>` + Transform_Date(value["Date_State"]) + `</td>
                <td>` + Transform_Date(array_1["Delivery"]) + `</td>
                <td>` + Transform_State_To_String(value["Next_State"]) + `</td>
                <td>` + value["Status"] + `</td>
            </tr>
        `);
    });
}

//////////////////////////////////////////////////////////////////////////// -> CUSTOMER VIEW <- ////////////////////////////////////////////////////////////////////////////

// CODE CUSTOMER

function Get_Customer(Name) { // Récupère le contenu du tableau Customers_Table avec un nom
    var temp = [];
    for(var i = 0; i < Customers_Table.length; i++) {
        if(Customers_Table[i]["Customer_Name"] == Name) {
            temp = Customers_Table[i]; // Insert Customers_Table[i] dans le tableau temp
        }
    }
    return temp;
}

function Get_Order_Customer(Name) { // Récupère le contenu du tableau Orders_Table avec un nom de client
    var temp = [];
    for(var i = 0; i < Orders_Table.length; i++) {
        if(Orders_Table[i]["Customer"] == Name) {
            temp.push(Orders_Table[i]); // Insert Orders_Table[i] dans le tableau temp
        }
    }
    temp.sort((a, b) => Convert_Date_Timestamp(a.Date_Purchase) + Convert_Date_Timestamp(b.Date_Purchase));
    return temp;
}

function Set_Track_Customer(array_1, array_2, array_3) { // Injecte du code html pour la page customer

    $("#Customers_Wrapper .Left_Content >").remove("*"); // Supprime le contenu de Left_Content
    $("#Customers_Wrapper .Right_Content >").remove("*"); // Supprime le contenu des Right_Content
    $("#Customers_Wrapper .Delete_Table").remove("*"); // Supprime le contenu des tableaux html

    $("#Customers_Wrapper .Title_Head p").text("Client " + array_1["Customer_Name"]);

    $(".Content_Customer .Left_Content").append(`
        <p>Identifiant de la société : ` + array_1["Customer_ID"] + `</p>
        <p>Nom de la société : ` + array_1["Customer_Name"] + `</p>
        <p>Numéro de SIRET : ` + array_1["Customer_SIRET"] + `</p>
    `);

    $(".Content_Customer .Right_Content").append(`
        <p>Nom du représentant : ` + array_1["Customer_Surname"] + `</p>
        <p>Email du représentant : ` + array_1["Customer_Mail"] + `</p>
    `);

    $("#Customers_Wrapper .Title_Current").text("Commandes en cours pour le client " + array_1["Customer_Name"]);

    array_2.forEach(function(value) { // Un boucle foreach classique (Un boucle qui parcours le tableau)
        var Track_Array = Get_Current_State_Track(Get_Track_Array_By_LTA_ID(value["LTA_ID"]));
        //$("#Current_Orders table") ceci est un selecteur css, là je suis entrain de target la balise "table" à l'intérieur d'une balise de classe "Current_Orders"
        //.append() ceci est une fonction qui permet d'injecter du code html, donc je suis entrain d'injecter le code html ci-dessous dans le selecteur ci_dessus 
        $("#Current_Customers table").append(` 
            <tr class="Delete_Table">
                <td>` + value["LTA_ID"] + `</td>
                <td class="Provider_Order">` + value["Provider"] + `</td>
                <td>` + Transform_Date(value["Date_Purchase"]) + `</td>
                <td>` + Transform_Date(value["Delivery"]) + `</td>
                <td>` + Transform_State_To_String(Track_Array["Next_State"]) + `</td>
                <td>` + value["Current_State"] + `</td>
                <td>
                    <button class="Current_Orders_Display" data-target="` + value["LTA_ID"] + `" data-state="` + value["Next_State"] + `"><i class="fas fa-eye"></i></button>
                    <button class="Current_Orders_Delete" data-target="` + value["LTA_ID"] + `"><i class="far fa-trash-alt"></i></button>
                </td>
            </tr>
        `);
    });

    $("#Customers_Wrapper .Title_Archive").text("Archives des commandes terminées du client " + array_1["Customer_Name"]);

    array_3.forEach(function(value) {
        var Error_State = "Non"
        if(value["Current_State"] == "Erreur") { // Vérifie si le paramètre "Current_State" est égal à "Erreur" à chaque itération 
            Error_State = "Oui"; // Si oui affiche oui dans le tableau archives
        }
        var Track_Array = Get_Current_State_Track(Get_Track_Array_By_LTA_ID(value["LTA_ID"]));
        $("#Archive_Customers table").append(`
            <tr class="Delete_Table">
                <td>` + value["LTA_ID"] + `</td>
                <td class="Provider_Order">` + value["Provider"] + `</td>
                <td>` + Transform_Date(value["Date_Purchase"]) + `</td>
                <td>` + Transform_Date(value["Delivery"]) + `</td>
                <td>` + Transform_Date(Track_Array["Date_State"]) + `</td>
                <td>` + Error_State + `</td>
                <td>
                    <button class="Current_Orders_Display" data-target="` + value["LTA_ID"] + `" data-state="` + Track_Array["Next_State"] + `"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `);
    });
}

//////////////////////////////////////////////////////////////////////////// -> PROVIDER VIEW <- ////////////////////////////////////////////////////////////////////////////

// CODE PROVIDER

function Get_Provider(Name) { // Récupère le contenu du tableau Providers_Table avec un nom
    var temp = [];
    for(var i = 0; i < Providers_Table.length; i++) {
        if(Providers_Table[i]["Provider_Name"] == Name) {
            temp = Providers_Table[i]; // Insert Providers_Table[i] dans le tableau temp
        }
    }
    return temp;
}

function Get_Order_Provider(Name) { // Récupère le contenu du tableau Orders_Table avec un nom de fournisseur
    var temp = [];
    for(var i = 0; i < Orders_Table.length; i++) {
        if(Orders_Table[i]["Provider"] == Name) {
            temp.push(Orders_Table[i]); // Insert Orders_Table[i] dans le tableau temp
        }
    }
    temp.sort((a, b) => Convert_Date_Timestamp(a.Date_Purchase) + Convert_Date_Timestamp(b.Date_Purchase));
    return temp;
}

function Set_Track_Provider(array_1, array_2, array_3) { // Injecte du code html pour la page customer
    $("#Providers_Wrapper .Left_Content >").remove("*"); // Supprime le contenu de Left_Content
    $("#Providers_Wrapper .Right_Content >").remove("*"); // Supprime le contenu des Right_Content
    $("#Providers_Wrapper .Delete_Table").remove("*"); // Supprime le contenu des tableaux html

    $("#Providers_Wrapper .Title_Head p").text("Fournisseur " + array_1["Provider_Name"]);

    $(".Content_Provider .Left_Content").append(`
        <p>Identifiant de la société : ` + array_1["Provider_ID"] + `</p>
        <p>Nom de la société : ` + array_1["Provider_Name"] + `</p>
        <p>Numéro de SIRET : ` + array_1["Provider_SIRET"] + `</p>
    `);

    $(".Content_Provider .Right_Content").append(`
        <p>Nom du représentant : ` + array_1["Provider_Surname"] + `</p>
        <p>Email du représentant : ` + array_1["Provider_Mail"] + `</p>
    `);

    $("#Providers_Wrapper .Title_Current").text("Commandes en cours pour le fournisseur " + array_1["Provider_Name"]);

    array_2.forEach(function(value) { // Un boucle foreach classique (Un boucle qui parcours le tableau)
        //$("#Current_Orders table") ceci est un selecteur css, là je suis entrain de target la balise "table" à l'intérieur d'une balise de classe "Current_Orders"
        //.append() ceci est une fonction qui permet d'injecter du code html, donc je suis entrain d'injecter le code html ci-dessous dans le selecteur ci_dessus 
        var Track_Array = Get_Current_State_Track(Get_Track_Array_By_LTA_ID(value["LTA_ID"]));
        $("#Current_Providers table").append(` 
            <tr class="Delete_Table">
                <td>` + value["LTA_ID"] + `</td>
                <td class="Customer_Order">` + value["Customer"] + `</td>
                <td>` + Transform_Date(value["Date_Purchase"]) + `</td>
                <td>` + Transform_Date(value["Delivery"]) + `</td>
                <td>` + Transform_State_To_String(Track_Array["Next_State"]) + `</td>
                <td>` + value["Current_State"] + `</td>
                <td>
                    <button class="Current_Orders_Display" data-target="` + value["LTA_ID"] + `" data-state="` + Track_Array["Next_State"] + `"><i class="fas fa-eye"></i></button>
                    <button class="Current_Orders_Delete" data-target="` + value["LTA_ID"] + `"><i class="far fa-trash-alt"></i></button>
                </td>
            </tr>
        `);
    });

    $("#Customers_Wrapper .Title_Archive").text("Archives des commandes terminées du fournisseur " + array_1["Provider_Name"]);

    array_3.forEach(function(value) {
        var Error_State = "Non"
        if(value["Current_State"] == "Erreur") { // Vérifie si le paramètre "Current_State" est égal à "Erreur" à chaque itération 
            Error_State = "Oui"; // Si oui affiche oui dans le tableau archives
        }
        var Track_Array = Get_Current_State_Track(Get_Track_Array_By_LTA_ID(value["LTA_ID"]));
        $("#Archive_Providers table").append(`
            <tr class="Delete_Table">
                <td>` + value["LTA_ID"] + `</td>
                <td class="Customer_Order">` + value["Customer"] + `</td>
                <td>` + Transform_Date(value["Date_Purchase"]) + `</td>
                <td>` + Transform_Date(value["Delivery"]) + `</td>
                <td>` + Transform_Date(Track_Array["Date_State"]) + `</td>
                <td>` + Error_State + `</td>
                <td>
                    <button class="Current_Orders_Display" data-target="` + value["LTA_ID"] + `" data-state="` + Track_Array["Next_State"] + `"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `);
    });
}

//////////////////////////////////////////////////////////////////////////// -> CREATE VIEW <- ////////////////////////////////////////////////////////////////////////////

// CODE CREATE ORDER

function Convert_Month(dt) {
    var Month = parseInt(dt.getMonth()) + 1;
    if(Month <= 9) {
        return "0" + Month;
    }
    else {
        return Month;
    }
}

function Check_Create_Form() {
    var error = false;
    $(".Check_Value").each(function() {
        var val = $(this).val();
        if(val == "" || val == " " || val == null) {
            $(this).css("border-color", "red");
            error = true;
        }
        else {
            $(this).css("border-color", "initial");
        }
    });
    return error;
}

function Set_New_Create() {
    $("#Customers_Create >").remove("*"); // Supprime toutes les options dans #Customers_Create
    $("#Providers_Create >").remove("*"); // Supprime toutes les options dans #Providers_Create
    $("#Date_Create").remove(); // Supprime l'input #Date_Create

    var dt = new Date();
    var Today_Date = dt.getFullYear() + "-" + Convert_Month(dt) + "-" + dt.getDate();
    Customers_Table.forEach(function(value) {
        $("#Customers_Create").append(`
            <option value="` + value["Customer_Name"] + `">` + value["Customer_Name"] + `</option>
        `);
    });

    Providers_Table.forEach(function(value) {
        $("#Providers_Create").append(`
            <option value="` + value["Provider_Name"] + `">` + value["Provider_Name"] + `</option>
        `);
    });

    $("#Create_Wrapper .Content_Create .Date").append(`<input type="date" id="Date_Create" class="Check_Value" name="trip-start" value="` + Today_Date + `">`);
}

//////////////////////////////////////////////////////////////////////////// -> DISPLAY CODE <- ////////////////////////////////////////////////////////////////////////////

function Show_Section(Target) { // Cette fonction permet d'afficher la section et cacher les autres avec paramètre l'id de la cible
    var Target_Table = $(".View_Wrapper");
    for(var i = 0; i < Target_Table.length; i++) {
        if($(Target_Table[i]).is(":visible")) {
            $(Target_Table[i]).animate({
                opacity: '0.0'
            }, 750);
            $(Target_Table[i]).css("display", "none");
        }
    }
    $("#" + Target).css("display", "block");
    $("#" + Target).animate({
        opacity: '1.0'
    }, 750);
}

function Show_Modal(Modal_State, LTA_Target) {
    if(Modal_State) {
        $("#Confirm_Delete").attr("data-target", LTA_Target);
        $("#Modal_Wrapper").css("display", "block");
        $("#Modal_Shadow").css("display", "block");
        $("#Modal_Wrapper").animate({
            opacity: '1.0'
        }, 500);
        $("#Modal_Shadow").animate({
            opacity: '1.0'
        }, 500);
    }
    else {
        $("#Modal_Wrapper").animate({
            opacity: '0.0'
        }, 500);
        $("#Modal_Shadow").animate({
            opacity: '0.0'
        }, 500);
        setTimeout(function() {
            $("#Modal_Wrapper").css("display", "none"); 
            $("#Modal_Shadow").css("display", "none");         
        }, 500);
    }
}

var current_notif = false;
function Send_Notification(message) {
    if(current_notif == false) {
        current_notif = true;
        $("html").append(`
            <div class="Notification_Container">
                <p>` + message + `</p>
            </div>
        `);

        $(".Notification_Container").animate({
            left: '0%'
        }, 500);

        setTimeout(function() {
            $(".Notification_Container").animate({
                left: '-100%'
            }, 1000);
            setTimeout(function() {
                $(".Notification_Container").remove("*");
            }, 1000);
            current_notif = false;
        }, 3500);
    }
}

//////////////////////////////////////////////////////////////////////////// -> MAIN CODE <- ////////////////////////////////////////////////////////////////////////////


$.when(Reload_Orders_SQL(), Reload_Orders_Track_SQL(), Reload_Customers_SQL(), Reload_Providers_SQL()).done(function() {
    $(document).ready(function() {
        Refresh_Delete_Order();
        Show_Section("Dashboard_Wrapper");

        $(document).on("click", "#Search_Button", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec l'id Search_Button
            var LTA_ID = $("#Search_Input").val(); // Récupère le contenu de l'input avec l'id Search_Input
            if(Check_Search_Orders(LTA_ID)) {
                Set_Track_Order(Get_Order_By_LTA_ID(LTA_ID), Get_Track_Array_By_LTA_ID(LTA_ID));
                Show_Section("Orders_Wrapper");
            }
        });

        $(document).on("click", ".Current_Orders_Display", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec la classe Current_Orders_Button
            var LTA_ID = $(this).attr("data-target");
            Show_Section("Orders_Wrapper");
            Set_Track_Order(Get_Order_By_LTA_ID(LTA_ID), Get_Track_Array_By_LTA_ID(LTA_ID));
        });

        $(document).on("click", ".Customer_Order", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec la classe Customer_Order
            Wrapper_Active = $(this).text();
            var Customer_Name = Wrapper_Active;
            var Customer_Order = Get_Order_Customer(Customer_Name);
            Show_Section("Customers_Wrapper");
            Set_Track_Customer(Get_Customer(Customer_Name), Get_Current_Order(Customer_Order), Get_Archive_Order(Customer_Order));
        });

        $(document).on("click", ".Provider_Order", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec la classe Provider_Order
            Wrapper_Active = $(this).text();
            var Provider_Name = Wrapper_Active;
            var Provider_Order = Get_Order_Provider(Provider_Name);
            Show_Section("Providers_Wrapper");
            Set_Track_Provider(Get_Provider(Provider_Name), Get_Current_Order(Provider_Order), Get_Archive_Order(Provider_Order));
        });

        $(document).on("click", "#Create_Order", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec l'id Create_Order
            Show_Section("Create_Wrapper");
            Set_New_Create();
        });

        $(document).on("click", "#Valid_Create", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec la classe Valid_Create
            var Customer = $("#Customers_Create").val();
            var Provider = $("#Providers_Create").val();
            var Description = $("#TextArea_Create").val();
            var Date_Delivery = $("#Date_Create").val();
            if(!Check_Create_Form()) {
                Add_New_Order(Customer, Provider, Description, Date_Delivery);
                $(".Check_Value").val("");
                Show_Section("Dashboard_Wrapper");
            }
            else {
                Send_Notification('<i class="fas fa-times" style="color:red!important"></i>Veuillez remplir tous les champs.');
            }
        });

        $(document).on("click", ".Return_Button", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec la classe Return_Button
            Show_Section("Dashboard_Wrapper");
        });

        $(document).on("click", ".Current_Orders_Delete", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec la classe Current_Orders_Delete
            var LTA_Target = $(this).attr("data-target");
            Show_Modal(true, LTA_Target);
        });

        $(document).on("click", "#Confirm_Delete", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec la classe Return_Button
            var LTA_Target = $(this).attr("data-target");
            Delete_Order_SQL(LTA_Target);
            Show_Modal(false, LTA_Target);
        });

        $(document).on("click", "#Cancel_Delete", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec la classe Return_Button
            Show_Modal(false, "");
        });

        $(document).on("click", ".Attachment_Button", function() { // Le code ci-dessous sera exécuter à chaque fois que quelqu'un clique sur le bouton avec la classe Attachment_Button
            var File_Target = $(this).attr("data-file");
            window.open(File_Target,"_blank");
        });
    });
});
