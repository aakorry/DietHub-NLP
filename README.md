# 🥪 Recipe URL to Sugar Level Estimation

## [App](https://ingbetic.vercel.app/)

<br/>

<div align="center">
    <img src="./asset/demo.gif">
</div>

<br/>

This entire frontend application is developed using **[Next.js 12](https://nextjs.org/blog/next-12)** and **[Typescript](https://www.typescriptlang.org/)**, not using **[Next.js 13.4](https://nextjs.org/blog/next-13-4)** due to the `@xenova/transformers` dependency called `sharp` couldn't resolved in Next.js 13.4 (ended up migrating from `app router` -> `pages router`).

Styling based on **[shadcnui.com](https://ui.shadcn.com/)** and **[Tailwind](https://tailwindcss.com/)**.

The model trained using [**HuggingFace Trainer API**](https://github.com/huggingface/transformers/blob/main/src/transformers/trainer.py) is being exported to `onnx` using `torch.onnx.export` which expects `input_ids` and `attention_mask` as inputs and outputs a regression value called `logits`. The `onnx` model then get further quantize into `int8` precision using `quantize_dynamic("", "", weight_type=QuantType.QUInt8)`.

In order to reduce the model deployment cost, [**edge deployment**](https://fullstackdeeplearning.com/course/2022/lecture-5-deployment/#3-move-to-the-edge) is used to load the `onnx` model directly to client side. However, the model doesn't include tokenizing text out of the box. To address the tokenizer issues, see how to tokenize text in JS/TS in [**model/inference.ts**](./app/lib/model/inference.ts). Not all tokenizer are being supported, see [**supported ones**](https://github.com/xenova/transformers.js/blob/8625f4aba35401f0231e2fa9222add4366ccd5ee/src/tokenizers.js#L3158). Consequently, the ingredients can be tokenized and then serve as the forward pass inputs to the `onnx` model.

Regarding the ingredients extraction from url, somehow this is quite manual. I used cheerio to scrape the elements nearby the `h1 ... h6` tags and return it as list. See how I [**scrape the ingredients**](/app/pages/api/index.ts) as an api.

## Dataset

This dataset is being normalized and can be downloaded here at [huggingface hub](https://huggingface.co/datasets/ziq/ingredient_to_sugar_level).

See how I processed the dataset: [process.ipynb](./data/process.ipynb).

The preprocessing notebook now includes optional advanced NLP pipelines and tooling support for:
- `nltk` (tokenization, stopwords, POS tagging, lemmatization)
- `spaCy` (linguistic pipeline/model support)
- `tokenizers` and `transformers` (subword tokenization and model-ready encoding)
- `scikit-learn` (TF-IDF feature extraction)

See [data/README.md](./data/) for more details.

Note: The result should `* 13.3627190349059 + 10.85810766787474` to obtain the actual sugar level.

## Model

The model is a fine-tuned version of [distilbert-base-uncased-finetuned-sst-2-english](https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english) and achieve 0.069200 loss.

Training/inference notebooks in `model/` now include:
- Cross-platform dependency setup cells
- Optional NLP resource setup (NLTK + spaCy model)
- Flexible dataset column mapping (`ingredients_clean`/`ingredients`, `sugar_per_serving_z`/`sugar`)
- Regression metrics reporting with `MAE` and `RMSE`

See [ziq/ingbetic](https://huggingface.co/ziq/ingbetic) at HuggingFace Hub and how to train the model using HuggingFace Trainer API [here](https://huggingface.co/ziq/ingbetic/blob/main/train.ipynb).

## Developer Instructions

### Data

- Dataset: `data/data.csv`
- Training column: `ingredients`
- Target column: `sugar_per_serving_g` (sugar in grams per serving)

### Models

| Model | Notebook | Output |
|-------|----------|--------|
| DistilBERT | `model/train_final.ipynb` | sugar_value (grams) |
| BERT | `model/train_final.ipynb` | sugar_value (grams) |
| Llama 7B QLoRA | `model/diabetes_guard_local_m1.ipynb` | sugar_value + sugar_level |

### WHO Sugar Classification

Apply to predictions and training labels:

```
Low:        <10g    (healthy)
Medium:     10-25g   (ok)
High:       25-40g   (limit)
Very High:  >40g    (avoid)
```

### Llama 7B Generation

Push both `sugar_value` and `sugar_level` (WHO classification) to Llama 7B for generating explanation.

### Frontend

```bash
cd DietHub-NLP/frontend
npm run dev
```

- Local: `http://localhost:5173`
- Deploy to Vercel when models are ready

## Acknowledgement

To all the framework and library maintainers.
