CREATE TABLE student (student_id     
VARCHAR(15)   PRIMARY KEY,first_name      
VARCHAR(100)  NOT NULL,last_name  
VARCHAR(100)  NOT NULL,email   
VARCHAR(150)  UNIQUE,password_hash   
VARCHAR(255),program        
VARCHAR(100)  NOT NULL DEFAULT 'Computer Engineering',level     
INT NOT NULL DEFAULT 200,phone  
VARCHAR(20),date_registered 
TIMESTAMP     DEFAULT NULL
);

CREATE TABLE lecturer (lecturer_id     
VARCHAR(15) PRIMARY KEY,first_name      
VARCHAR(100)  NOT NULL,last_name       
VARCHAR(100)  NOT NULL,email           
VARCHAR(150)  UNIQUE,department      
VARCHAR(100)  NOT NULL DEFAULT 'Computer Engineering'
);

CREATE TABLE ta (ta_id           
VARCHAR(15)   PRIMARY KEY,first_name      
VARCHAR(100)  NOT NULL,last_name       
VARCHAR(100)  NOT NULL,email           
VARCHAR(150)  UNIQUE
);

CREATE TABLE course (course_id       
VARCHAR(15)   PRIMARY KEY,course_title    
VARCHAR(150)  NOT NULL,credit_hours    
INT NOT NULL,level           
INT NOT NULL DEFAULT 200
);

CREATE TABLE student_fees (fee_id          
SERIAL PRIMARY KEY,student_id      
VARCHAR(15)   NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,semester        
VARCHAR(20)   NOT NULL,amount_billed   
NUMERIC(10,2) NOT NULL CHECK (amount_billed >= 0),amount_paid     
NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0)
);

CREATE TABLE enrollment (enrollment_id   
SERIAL PRIMARY KEY,student_id      
VARCHAR(15)   NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,course_id       
VARCHAR(15)   NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,semester        
VARCHAR(20)   NOT NULL,date_enrolled   
DATE NOT NULL DEFAULT CURRENT_DATE,
UNIQUE (student_id, course_id, semester)
);

CREATE TABLE lecturer_course (id              
SERIAL PRIMARY KEY,lecturer_id     
VARCHAR(15) NOT NULL REFERENCES lecturer(lecturer_id) ON DELETE CASCADE,course_id       
VARCHAR(15) NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,semester        
VARCHAR(20) NOT NULL,
UNIQUE (lecturer_id, course_id, semester)
);

CREATE TABLE lecturer_ta (id              
SERIAL PRIMARY KEY,lecturer_id     
VARCHAR(15) NOT NULL REFERENCES lecturer(lecturer_id) ON DELETE CASCADE,ta_id           
VARCHAR(15) NOT NULL REFERENCES ta(ta_id) ON DELETE CASCADE,course_id       
VARCHAR(15) NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,semester        
VARCHAR(20) NOT NULL,
UNIQUE (lecturer_id, ta_id, course_id, semester)
);