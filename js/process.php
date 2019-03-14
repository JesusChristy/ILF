<?php
    function Create_LTA_ID() {
        $Characters_String = "0123456789";
        $Characters_Length = strlen($Characters_String);
        $Result = "";
        for ($i = 0; $i < 8; $i++) {
            $Result .= $Characters_String[rand(0, $Characters_Length - 1)];
        }
        return $Result;
    }

    function Secure_XSS($data) {
        if(gettype($data) == "array") {
            foreach($data as $value) {
                if(gettype($value) == "string") {
                    $value = strip_tags(strval($value));
                }
            }
        }
        elseif(gettype($data) == "string") {
            $data = strip_tags($data);
        }
        return $data;
    }

    if(!empty($_POST["AJAX_ID"])) {
        $Process_ID = Secure_XSS($_POST["AJAX_ID"]);
        $Procces_Data = Secure_XSS($_POST["AJAX_DATA"]);
        try {
            $pdo = new PDO('mysql:host=localhost;dbname=ilf_db', "root", "");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            $pdo->exec("set names utf8");

            if($Process_ID == 1) { // Reload Orders
                $sql = $pdo->prepare("SELECT * FROM orders ORDER BY Date_Purchase DESC LIMIT 1000");
                $sql->execute();
                $result = $sql->fetchAll(PDO::FETCH_ASSOC); //fetchAll = Get all result in table.
                if(!empty($result)) {
                    echo(json_encode($result));
                }
                else {
                    echo("Failed !");
                }
            }
            else if($Process_ID == 2) { // Reload Orders_Track
                $sql = $pdo->prepare("SELECT * FROM orders_track LIMIT 1000");
                $sql->execute();
                $result = $sql->fetchAll(PDO::FETCH_ASSOC); //fetchAll = Get all result in table.
                if(!empty($result)) {
                    echo(json_encode($result));
                }
                else {
                    echo("Failed !");
                }
            }
            else if($Process_ID == 3) { // Reload Customers
                $sql = $pdo->prepare("SELECT * FROM customers LIMIT 1000");
                $sql->execute();
                $result = $sql->fetchAll(PDO::FETCH_ASSOC); //fetchAll = Get all result in table.
                if(!empty($result)) {
                    echo(json_encode($result));
                }
                else {
                    echo("Failed !");
                }
            }
            else if($Process_ID == 4) { // Reload Providers
                $sql = $pdo->prepare("SELECT * FROM providers LIMIT 1000");
                $sql->execute();
                $result = $sql->fetchAll(PDO::FETCH_ASSOC); //fetchAll = Get all result in table.
                if(!empty($result)) {
                    echo(json_encode($result));
                }
                else {
                    echo("Failed !");
                }
            }
            else if($Process_ID == 5) { // Delete
                $sql = $pdo->prepare("SELECT * FROM orders WHERE LTA_ID = :L_ID LIMIT 1");
                $sql->bindValue('L_ID', $Procces_Data);
                $sql->execute();
                $result_1 = $sql->fetch(PDO::FETCH_ASSOC); //fetch = Get first result_1 in table.

                $sql = $pdo->prepare("SELECT * FROM orders_track WHERE LTA_ID = :L_ID LIMIT 1");
                $sql->bindValue('L_ID', $Procces_Data);
                $sql->execute();
                $result_2 = $sql->fetch(PDO::FETCH_ASSOC); //fetch = Get first result_2 in table.

                if(!empty($result_1)) {
                    if(!empty($result_2)) {
                        $sql = $pdo->prepare("DELETE FROM orders WHERE LTA_ID = :L_ID");
                        $sql->bindValue('L_ID', $Procces_Data);
                        $sql->execute();

                        $sql = $pdo->prepare("DELETE FROM orders_track WHERE LTA_ID = :L_ID");
                        $sql->bindValue('L_ID', $Procces_Data);
                        $sql->execute();

                        echo("Succes !");
                    }
                    else {
                        echo("Failed !");
                    }
                }
                else {
                    echo("Failed !");
                }
            }
            else if($Process_ID == 6) { // Create
                while(true) {
                    $LTA_ID = Create_LTA_ID();
                    $sql = $pdo->prepare("SELECT LTA_ID FROM orders WHERE LTA_ID = :L_ID LIMIT 1");
                    $sql->bindValue('L_ID', intval($LTA_ID));
                    $sql->execute();
                    $result = $sql->fetch(PDO::FETCH_ASSOC); //fetch = Get first result in table.
                    if(empty($result)) {
                        $sql = $pdo->prepare("INSERT INTO orders (LTA_ID, Customer, Provider, Description, Delivery) VALUES (:L_ID, :L_Customer, :L_Provider, :L_Description, :L_Date_Delivery)");
                        $sql->bindValue('L_ID', intval($LTA_ID));
                        $sql->bindValue('L_Customer', $Procces_Data["Customer"]);
                        $sql->bindValue('L_Provider', $Procces_Data["Provider"]);
                        $sql->bindValue('L_Description', $Procces_Data["Description"]);
                        $sql->bindValue('L_Date_Delivery', $Procces_Data["Date_Delivery"]);
                        $sql->execute();

                        $sql = $pdo->prepare("INSERT INTO orders_track (LTA_ID, Next_State) VALUES (:L_ID, :L_State)");
                        $sql->bindValue('L_ID', intval($LTA_ID));
                        $sql->bindValue('L_State', 0);
                        $sql->execute();
                        
                        echo("Succes !");
                        break;
                    }
                }
            }
        }
        catch (PDOException $e) {
            var_dump($getMessage->e);
            $pdo = null;
            die();
            exit;
        }
    }
?>