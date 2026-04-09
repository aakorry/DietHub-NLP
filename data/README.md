# Dataset

This dataset is further processed from one of the most popular datasets in [food computing](http://123.57.42.89/FoodComputing__Dataset.html), so called Yummly-66K.

## Dataset description

This dataset consists of 66,615 recipe items from Yummly, namely Yummly_66K. Each recipe item includes the recipe name, preprocessed ingredient line, recipe image, cuisine and course attribute information, and so on. There are totally 10 kinds of cuisines, 14 kinds of courses and 2,416 ingredients in our dataset.

## Download address

<https://github.com/minweiqing/You-Are-What-You-Eat-Exploring-Rich-Recipe-Information-for-Cross-Region-Food-Analysis>

Direct dataset link from the upstream repository README:

<https://drive.google.com/open?id=1U5a-1R-b4Gl_La0rUAFWDgM8eIAF_pR3>

After downloading and extracting, the metadata JSON files used in this project are located at:

`Yummly-66K/food_min/Yummly28K.zip/metadata27638`

The folder contains 27,638 files named from `meta00001.json` to `meta27638.json`.

## Processed Dataset

This dataset can be downloaded here at [huggingface hub](https://huggingface.co/datasets/ziq/ingredient_to_sugar_level)

See how I processed the dataset: [process.ipynb](./process.ipynb)

The notebook includes both classic and modern NLP preprocessing:
- HTML/web-text cleanup and entity decoding
- Unicode normalization and ASCII transliteration
- Careful tokenization that preserves quantities like `3/4`
- Stopword filtering
- Optional POS tagging and lemmatization via NLTK
- Optional subword tokenization via Hugging Face tokenizers/transformers
- Optional TF-IDF feature generation via scikit-learn

Optional Python dependencies used in the notebook:
- `nltk`
- `spacy`
- `tokenizers`
- `transformers`
- `scikit-learn`
- `datasets`
- `huggingface_hub`

## Papers cited

```latex
@Article{Min-YAWYE-TMM2018,
  author =  {W. Min and B. K. Bao and S. Mei and Y. Zhu and Y. Rui and S. Jiang},
  title =   {You are what you eat: Exploring rich recipe information for cross-region food analysis},
  journal = {IEEE Transactions on Multimedia},
  year =    {2018},
  volume =  {20},
  number =  {4},
  pages =   {950-964}
}
```
