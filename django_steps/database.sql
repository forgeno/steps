SET autocommit=0;
START TRANSACTION;
USE stepsdb;


CREATE TABLE IF NOT EXISTS tblPedestrianData (
	pedestrian_ID INT AUTO_INCREMENT,
	longitude DECIMAL(18, 14) NOT NULL, 
	latitude DECIMAL (18, 14) NOT NULL,
	recorded_time VARCHAR(255) NULL,
	speed VARCHAR(255) NULL, 
	activity_title VARCHAR(255) NULL, 
	activity_confidence INT NULL, 
	crosswalk BOOLEAN NULL, 
	waiting_time VARCHAR(255) NULL,
	PRIMARY KEY (pedestrian_ID)
) ENGINE=INNODB;


CREATE TABLE IF NOT EXISTS tblSidewalkData (
	sidewalk_ID INT AUTO_INCREMENT,
	address VARCHAR(255) NOT NULL, 
    start_latitude DECIMAL (18, 14) NOT NULL,
	start_longitude DECIMAL (18, 14) NOT NULL,
    end_latitude DECIMAL (18, 14) NOT NULL,
	end_longitude DECIMAL (18, 14) NOT NULL,
	PRIMARY KEY (sidewalk_ID)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS tblSidewalkComments (
	sidewalk_comments_ID INT AUTO_INCREMENT,
    sidewalk_ID INT NOT NULL,
	comment_text TEXT NOT NULL, 
    posted_time DATETIME NOT NULL,
    is_deleted BOOLEAN NOT NULL,
	PRIMARY KEY (sidewalk_comments_ID),
    FOREIGN KEY (sidewalk_ID)
		REFERENCES tblSidewalkData(sidewalk_ID)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS tblSidewalkImages (
	sidewalk_images_ID INT AUTO_INCREMENT,
    sidewalk_ID INT NOT NULL,
	image_url VARCHAR(255) NOT NULL, 
    posted_time DATETIME NOT NULL,
    is_pending BOOLEAN NOT NULL,
    is_deleted BOOLEAN NOT NULL,
	PRIMARY KEY (sidewalk_images_ID),
    FOREIGN KEY (sidewalk_ID)
		REFERENCES tblSidewalkData(sidewalk_ID)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS tblSidewalkRating (
	sidewalk_rating_ID INT AUTO_INCREMENT,
    sidewalk_ID INT NOT NULL,
	accessibility_rating FLOAT (3,1),
    connectivity_rating FLOAT (3,1),
    comfort_rating FLOAT (3,1),
    safety_rating FLOAT (3,1),
    security_rating FLOAT (3,1),
    posted_time DATETIME NOT NULL,
	PRIMARY KEY (sidewalk_rating_ID),
    FOREIGN KEY (sidewalk_ID)
		REFERENCES tblSidewalkData(sidewalk_ID)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS tblAdmin (
	administrator_ID INT AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
	admin_email VARCHAR(255),
	admin_password CHAR(64) NOT NULL,
	PRIMARY KEY (administrator_ID)
) ENGINE=INNODB;

ROLLBACK;


DROP TABLE IF EXISTS tblpedestriandata ;
DROP TABLE IF EXISTS tblsidewalkimages ;
DROP TABLE IF EXISTS tblsidewalkcomments ;
DROP TABLE IF EXISTS tblsidewalkdata ;

FLUSH TABLES;



