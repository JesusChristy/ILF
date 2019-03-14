Procédure d'installation :

    1. - Installation du serveur web (Wamp)
    2. - Importation de la base de données
    3. - Ajout du projet dans www
    4. - Accéder au projet iLF
    



Installation du serveur (Wamp) :

    Télécharger l'exécutable depuis le lien suivant : http://www.wampserver.com/
    
    Installer le logiciel Wamp depuis l'exécutable téléchargé.
    
    Lancer le logiciel et vérifier le fonctionnement du serveur en vous connectant au lien suivant "localhost" 
    avec votre navigateur internet.
    
    Si vous souhaitez modifier le mot de passe de votre base de données suiver la procédure ci-dessous :
    
      Chapitre IV sur le lien suivant : https://www.it-connect.fr/changer-de-mot-de-passe-mysql%EF%BB%BF/
      
    Après le changement de mot de passe vous devez modifier la ligne 30 du fichier ./js/process.php,
    
    '$pdo = new PDO('mysql:host=localhost;dbname=ilf_db', "root", "");'
    
        -> "root", par votre nom d'utilisateur MYSQL
        -> "", par votre nouveau mot de passe
      
   
Importation de la base de données (ilf_db.sql) :

    Nous utiliserons "PHPMyAdmin" pour l'importation mais vous pouvez utiliser n'importe qu'elle autre 
    SGBD (Système Gestion Base de Données).
    
    Création d'une base de données "ilf_db" avec un interclassement "utf8_general_ci".
    
    Importation du fichier "ilf_db.sql" dans la base de données précedemment créée.
    
    Modifier la ligne 7 et 8 de la page "index.php" avec le nom d'utilisateur et le mot de passe de votre base de 
    données, par défault votre nom d'utilisateur et votre mot de passe sont user = "root" password = "".
    
    
    
Ajout du projet dans www :
    
    Déplacer le contenu du dossier "iLF" dans votre répertoire www, par défault le chemin relatif de Wamp est 
    "C:\wamp64\www".
    
    Si c'est votre première installation wamp supprimer le contenu du dossier www, il faut que l'index.php 
    soit à la racine du dossier www.


Accéder au projet iLF :

    Pour accéder au projet iLF, il vous suffit de vous connecter au lien suivant "localhost" avec votre 
    navigateur internet.
