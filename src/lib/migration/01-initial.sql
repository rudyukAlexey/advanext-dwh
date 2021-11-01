--CREATE TABLE IF NOT EXISTS "advanext"
--(
--    "id"             character varying        NOT NULL,
--    "advanext_table" character varying        NOT NULL,
--    "number"         integer                  NOT NULL,
--    "version"        integer                  NOT NULL,
--    "view_created"   TIMESTAMP WITH TIME ZONE NOT NULL,
--    "view_updated"   TIMESTAMP WITH TIME ZONE NOT NULL,
--    "data"           super                    NOT NULL,
--    CONSTRAINT "PK_4ceda725a323d254a5fd48bf95f" PRIMARY KEY ("id")
--)

CREATE TABLE IF NOT EXISTS "advanext_table_info"
(
    id INT IDENTITY(0, 1) NOT NULL,
    table_name CHARACTER VARYING NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "advanext_field"
(
    id INT IDENTITY(0, 1) NOT NULL,
    table_id INT NOT NULL,
    name CHARACTER VARYING NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (table_id) REFERENCES advanext_table_info(id)
);



