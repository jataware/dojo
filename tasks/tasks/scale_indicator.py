from utils import download_rawfile, put_rawfile
import pandas as pd
import numpy as np
import os
import logging

def scale_indicator(context):
    logging.info(f"Scaling indicator {context.get('uuid')}")
    data_paths=context.get('dataset').get('data_paths')
    data_paths_normalized=context.get('dataset').get('data_paths_normalized')
    min_max_mapping={}
    for path in data_paths:
        # current_df=pd.read_parquet(path)
        filename=path.split('/')[-1]
        try:        
            logging.info(f'downloading for s3 {path}')
            download_rawfile(path, f"processing/{filename}")
        except FileNotFoundError as e:
            return {"success":False,'message':"File not found"}
        
        current_df=pd.read_parquet(f"processing/{filename}")

        features = current_df.feature.unique()
        for f in features:
            feat = current_df[current_df["feature"] == f]
            current_min=np.min(feat["value"])
            current_max=np.max(feat["value"])
            min_max_mapping[f] = {
                "min": min(
                    current_min, 
                    min_max_mapping.get(f,{}).get("min", current_min)
                ),
                "max": max(
                    current_max,
                    min_max_mapping.get(f,{}).get("max", current_max)
                )
            }

    
    logging.info(f'min max values for all files: {min_max_mapping}')

    for path in data_paths:
        filename=path.split('/')[-1]
        current_df=pd.read_parquet(f"processing/{filename}")
        df_norm=scale_dataframe(current_df,min_max_mapping)
        
        norm_filename = filename.split(".parquet")[0] + "_normalized.parquet.gzip"
        df_norm.to_parquet(f"processing/{norm_filename}", compression="gzip")
        dest_path_norm = os.path.join(
            os.getenv("DATASET_STORAGE_BASE_URL"), context.get('uuid'), norm_filename
        )
        with open(f"processing/{norm_filename}", "rb") as f:
            put_rawfile(path=dest_path_norm, fileobj=f)
        
        os.remove(f"processing/{filename}")
        os.remove(f"processing/{norm_filename}")
    return True
        

def scale_dataframe(dataframe, mapper):
    """
    This function accepts a dataframe in the canonical format
    and min/max scales each feature to between 0 to 1
    """
    dfs = []
    features = mapper.keys()
    print(features)

    for f in features:
        feat = dataframe[dataframe["feature"] == f]
        feat["value"] = scale_data(feat["value"], mapper[f])
        dfs.append(feat)
    return pd.concat(dfs)


def scale_data(data,min_max_dict):
    """
    This function takes in an array and performs 0 to 1 normalization on it.
    It is robust to NaN values and ignores them (leaves as NaN).
    """
    return (data - min_max_dict.get('min')) / (min_max_dict.get('max') - min_max_dict.get('min') )