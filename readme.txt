#create table trial

CREATE TABLE trial (
    reviewed_by TEXT,
    trial_idc_identifier TEXT,
    trial_external_identifier_source TEXT,
    trial_external_identifier TEXT,
    number_of_therapeutics_assessed_for_ada_in_trial TEXT,
    therapeutic_assessed_for_ada_inn_name TEXT,
    therapeutic_assessed_for_ada_trade_name TEXT,
    therapeutic_assessed_for_ada_protein_idc_identifier TEXT,
    trial_datapoint_idc_identifier_row_identifier TEXT,
    trial_arm_datapoint_identifier TEXT,
    immunogenicity_testing TEXT,
    trial_arm_description TEXT,
    trial_arm_timepoint_description TEXT,
    disease_indication_category TEXT,
    disease_indication_description TEXT,
    coadministered_drugs TEXT,
    patient_population TEXT,
    trial_start_date TEXT,
    trial_end_date TEXT,
    therapeutic_route_of_administration TEXT,
    dosing_description TEXT,
    immunogenicity_results_timepoint_post_initial_dose_days TEXT,
    number_of_patients_analyzed_for_ada TEXT,
    number_of_ada_plus_patients TEXT,
    percentage_of_ada_plus_patients TEXT,
    ada_detection_assay_used TEXT,
    number_of_patients_analyzed_for_ada_titers TEXT,
    average_ada_titers TEXT,
    nadas_detected TEXT,
    number_of_patients_analyzed_for_nadas_titers TEXT,
    average_nadas_titers TEXT,
    number_of_patients_analyzed_for_nada TEXT,
    number_of_patients_with_nadas TEXT,
    percentage_nada_plus_patients_reported TEXT,
    percent_patients_with_hypersensitivity_injection_site_reactions TEXT,
    ada_interpreted_to_impact_pk TEXT,
    ada_interpreted_to_impact_efficacy TEXT,
    immunocompromised_status_indicator FLOAT,
    trial_sponsor TEXT,
    trial_data_source_type TEXT,
    prospective_or_retrospective TEXT,
    randomized_or_not_randomized TEXT,
    trial_blinding_type TEXT,
    therapeutic_comparator TEXT,
    trial_primary_endpoint TEXT,
    patients_sample_size FLOAT,
    demographics_sample_size FLOAT,
    patient_population_average_age FLOAT,
    patient_population_age_standard_deviation FLOAT,
    gender_ratio_m_f FLOAT,
    demographics_race_white_number_of_patients FLOAT,
    demographics_race_white FLOAT,
    demographics_race_black_or_african_american_number_of_patients FLOAT,
    demographics_race_black_or_african_american FLOAT,
    demographics_race_american_indian_or_alaska_native_num FLOAT,
    demographics_race_american_indian_or_alaska_native FLOAT,
    demographics_race_asian_number_of_patients FLOAT,
    demographics_race_asian FLOAT,
    demographics_race_asian_american_number_of_patients FLOAT,
    demographics_race_asian_american FLOAT,
    demographics_race_asian_indian_number_of_patients FLOAT,
    demographics_race_asian_indian FLOAT,
    demographics_race_chinese_number_of_patients FLOAT,
    demographics_race_chinese FLOAT,
    demographics_race_filipino_number_of_patients FLOAT,
    demographics_race_filipino FLOAT,
    demographics_race_japanese_number_of_patients FLOAT,
    demographics_race_japanese FLOAT,
    demographics_race_korean_number_of_patients FLOAT,
    demographics_race_korean FLOAT,
    demographics_race_vietnamese_number_of_patients FLOAT,
    demographics_race_vietnamese FLOAT,
    demographics_race_other_asian_number_of_patients FLOAT,
    demographics_race_other_asian FLOAT,
    demographics_race_native_hawaiian_number_of_patients FLOAT,
    demographics_race_native_hawaiian FLOAT,
    demographics_race_guamanian_or_chamorro_number_of_patients FLOAT,
    demographics_race_guamanian_or_chamorro FLOAT,
    demographics_race_samoan_number_of_patients FLOAT,
    demographics_race_samoan FLOAT,
    demographics_race_other_pacific_islander_number_of_patients FLOAT,
    demographics_race_other_pacific_islander FLOAT,
    demographics_race_native_hawaiian_or_other_pacific_islander_num FLOAT,
    demographics_race_native_hawaiian_or_other_pacific_islander FLOAT,
    demographics_race_more_than_one_race_number_of_patients FLOAT,
    demographics_race_more_than_one_race FLOAT,
    demographics_race_unknown_number_of_patients FLOAT,
    demographics_race_unknown FLOAT,
    demographics_race_other_number_of_patients FLOAT,
    demographics_race_other FLOAT,
    demographics_ethnicity_hispanic_number_of_patients FLOAT,
    demographics_ethnicity_hispanic FLOAT,
    demographics_ethnicity_not_hispanic_number_of_patients FLOAT,
    demographics_ethnicity_not_hispanic FLOAT,
    demographics_ethnicity_unknown_not_reported_number_of_patients FLOAT,
    demographics_ethnicity_unknown_not_reported TEXT,
    other_notes TEXT
);


#loading the data

\copy trial FROM 'D:\\my-app\\records_cleaned.csv' DELIMITER ',' CSV HEADER;


#create table antibodies

CREATE TABLE antibodies (
    Antibody VARCHAR(255),
    Target VARCHAR(255),
    Subclass VARCHAR(255),
    CL_ml_day_kg FLOAT,
    Q_ml_day_kg FLOAT,
    Vc_ml_kg FLOAT,
    Vp_ml_kg FLOAT,
    Reference TEXT,
    LinearKinetics VARCHAR(255)
);


#loading the data

\copy antibodies FROM 'D:\\my-app\\antibodies.csv' DELIMITER ',' CSV HEADER;


#download 

https://nodejs.org/en
npm install react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install axios
npm install papaparse
npm install @mui/lab


