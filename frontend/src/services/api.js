import { HfInference } from '@huggingface/inference'
import { CONFIG } from '../config'

const DEMO_MODE = true  // Set false when you have real token

const getHfClient = () => {
  const token = import.meta.env.VITE_HF_TOKEN
  if (!token || token === 'YOUR_TOKEN_HERE' || token.startsWith('hf_')) {
    if (DEMO_MODE) return null
    throw new Error('Please set VITE_HF_TOKEN in your .env file')
  }
  return new HfInference(token)
}

export async function predictSugar(ingredients) {
  const hf = getHfClient()
  
  // Demo mode - estimate based on ingredients
  if (!hf) {
    const sugarWords = ['sugar', 'honey', 'syrup', 'molasses', 'brown sugar', 'powdered sugar', 'corn syrup']
    const lowerIng = ingredients.toLowerCase()
    let estimatedSugar = 5 // default low
    
    for (const word of sugarWords) {
      if (lowerIng.includes(word)) {
        if (word === 'honey' || word === 'syrup' || word === 'molasses') {
          estimatedSugar = 25 + Math.random() * 15
        } else if (word === 'brown sugar' || word === 'corn syrup') {
          estimatedSugar = 20 + Math.random() * 15
        } else {
          estimatedSugar = 15 + Math.random() * 15
        }
        break
      }
    }
    
    const category = getCategoryFromSugar(estimatedSugar)
    return `${estimatedSugar.toFixed(1)}g - ${category}`
  }
  
  const response = await hf.chatCompletion({
    model: CONFIG.modelId,
    messages: [{
      role: 'user',
      content: `Recipe: ${ingredients}\nPredict sugar per serving in grams. Format: "Xg - Category" where Category is Low/Medium/High/Very High based on WHO: Low(<10g), Medium(10-25g), High(25-40g), Very High(>40g)`
    }],
    max_new_tokens: 50
  })
  
  return response.choices[0].message.content
}

export async function generateExplanation(ingredients, sugarG, category) {
  const hf = getHfClient()
  
  // Demo mode - generate explanation
  if (!hf) {
    const explanations = {
      'Low': `This recipe has ${sugarG.toFixed(1)}g sugar, which is LOW. Additional health benefits. Recommended for diabetes prevention and overall wellbeing.`,
      'Medium': `This recipe has ${sugarG.toFixed(1)}g sugar, which is MEDIUM. Acceptable intake. Consume in moderation as part of a balanced diet.`,
      'High': `This recipe has ${sugarG.toFixed(1)}g sugar, which is HIGH. Limit consumption for diabetes management. Pair with fiber-rich foods to help balance blood sugar.`,
      'Very High': `This recipe has ${sugarG.toFixed(1)}g sugar, which is VERY HIGH. High risk for blood sugar spikes. Avoid frequent consumption, especially for those managing diabetes.`
    }
    return explanations[category] || explanations['Medium']
  }
  
  const response = await hf.chatCompletion({
    model: CONFIG.modelId,
    messages: [{
      role: 'user',
      content: `Recipe: ${ingredients}\nSugar: ${sugarG}g (${category})\nWHO: ${getWhoInfo(category)}\nExplain health impact and give dietary advice in 1-2 sentences:`
    }],
    max_new_tokens: 80
  })
  
  return response.choices[0].message.content
}

function getWhoInfo(category) {
  const info = {
    'Low': 'Additional health benefits. Recommended.',
    'Medium': 'Acceptable. Consume in moderation.',
    'High': 'High sugar. Limit consumption.',
    'Very High': 'Very high sugar. Avoid frequent consumption.'
  }
  return info[category] || ''
}

export function getCategoryFromSugar(g) {
  if (g < 10) return 'Low'
  if (g < 25) return 'Medium'
  if (g < 40) return 'High'
  return 'Very High'
}

export function getWhoInfoStatic(category) {
  const info = {
    'Low': { range: '<10g', description: 'Additional health benefits', advice: 'Recommended for diabetes prevention' },
    'Medium': { range: '10-25g', description: 'Acceptable intake', advice: 'Consume in moderation' },
    'High': { range: '25-40g', description: 'High sugar content', advice: 'Limit consumption for diabetes management' },
    'Very High': { range: '>40g', description: 'Very high sugar', advice: 'Avoid frequent consumption' }
  }
  return info[category] || { range: 'N/A', description: 'N/A', advice: 'N/A' }
}

const DEMO_RECIPES = {
  'chocolate cake': `Ingredients:
- 2 cups all-purpose flour
- 1 cup unsweetened cocoa powder
- 1 tsp baking soda
- 1/2 tsp salt
- 1 cup butter, softened
- 1 3/4 cups sugar
- 3 large eggs
- 2 tsp vanilla extract
- 1 cup buttermilk
- 1 cup hot water

Instructions:
1. Preheat oven to 350°F (175°C). Grease and flour two 9-inch round pans.
2. Mix flour, cocoa, baking soda, and salt in a bowl. Set aside.
3. Beat butter and sugar until light and fluffy. Add eggs one at a time, then vanilla.
4. Alternately add flour mixture and buttermilk to butter mixture.
5. Stir in hot water (batter will be thin).
6. Pour into prepared pans and bake 30-35 minutes.
7. Cool in pans for 10 minutes, then remove to wire racks.`,
  'apple pie': `Ingredients:
- 6 cups sliced apples
- 3/4 cup sugar
- 2 tbsp flour
- 1 tsp cinnamon
- 1/4 tsp nutmeg
- 1 tbsp butter
- 2 pie crusts (store-bought or homemade)

Instructions:
1. Preheat oven to 425°F (220°C).
2. Mix apples with sugar, flour, cinnamon, and nutmeg.
3. Line pie plate with one crust. Fill with apple mixture.
4. Dot with butter. Cover with second crust.
5. Seal edges and cut slits for steam. Bake 40-45 minutes.
6. Cool before serving.`,
  'brownies': `Ingredients:
- 1/2 cup butter
- 1 cup sugar
- 2 large eggs
- 1 tsp vanilla
- 1/3 cup cocoa powder
- 1/2 cup flour
- 1/4 tsp salt
- 1/4 tsp baking powder

Instructions:
1. Preheat oven to 350°F (175°C). Grease 8x8 inch pan.
2. Melt butter, stir in sugar, eggs, and vanilla.
3. Mix in cocoa, flour, salt, and baking powder.
4. Spread in pan and bake 25-30 minutes.
5. Cool before cutting into squares.`,
  'default': `Ingredients:
- 2 cups all-purpose flour
- 1 cup sugar
- 1/2 cup butter, softened
- 2 large eggs
- 1 tsp baking powder
- 1/2 tsp salt
- 1 cup milk
- 2 tsp vanilla extract

Instructions:
1. Preheat oven to 350°F (175°C). Grease a 9x13 inch pan.
2. Cream butter and sugar until fluffy. Beat in eggs.
3. Mix flour, baking powder, and salt separately.
4. Add dry ingredients to wet alternating with milk.
5. Stir in vanilla. Pour into pan.
6. Bake 35-40 minutes until toothpick comes out clean.`
}

export async function generateRecipe(dishName) {
  const hf = getHfClient()
  const dish = dishName.toLowerCase().trim()
  
  if (!hf) {
    await new Promise(resolve => setTimeout(resolve, 800))
    const demoRecipe = DEMO_RECIPES[dish] || DEMO_RECIPES['default']
    return demoRecipe
  }
  
  const response = await hf.chatCompletion({
    model: CONFIG.modelId,
    messages: [{
      role: 'user',
      content: `Generate a complete recipe for "${dishName}" with:
1. Ingredients list (with measurements)
2. Step-by-step cooking instructions

Format clearly with "Ingredients:" and "Instructions:" sections. Be detailed and accurate.`
    }],
    max_new_tokens: 300
  })
  
  return response.choices[0].message.content
}

export const HEALTH_QUOTES = [
  "A healthy diet is the foundation of diabetes prevention and management.",
  "Small changes in what you eat can make a big difference in your health.",
  "Fiber-rich foods help stabilize blood sugar levels.",
  "Eating whole foods is nature's medicine.",
  "Balance is key - enjoy treats in moderation.",
  "Your fork is your most powerful tool for health.",
  "Water is the best beverage for diabetes prevention.",
  "Every meal is an opportunity to nourish your body.",
  "Plan your meals, control your health.",
  "Prevention starts with informed choices."
]

export const FUNCTIONAL_QUOTES = [
  "Let food be thy medicine and medicine be thy food. — Hippocrates",
  "The greatest wealth is health. — Virgil",
  "Take care of your body. It's the only place you have to live. — Jim Rohn",
  "Eat food. Not too much. Mostly plants. — Michael Pollan",
  "One cannot think well, love well, sleep well, if one has not dined well. — Virginia Woolf",
  "Exercise is king; nutrition is queen. Put them together and you've got a kingdom. — Jack LaLanne",
  "You are what you eat. — G.K. Chesterton",
  "The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison. — Ann Wigmore",
  "The doctor of the future will give no medicine but will interest his patients in diet and in the cause and prevention of disease. — Thomas Edison",
  "A healthy outside starts from the inside. — Unknown",
  "Health is not about the weight you lose, but about the life you gain. — Dr. Josh Axe",
  "Don't eat anything your great-grandmother wouldn't recognize as food. — Michael Pollan"
]