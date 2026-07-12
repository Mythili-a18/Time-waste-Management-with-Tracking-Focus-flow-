# Welcome to FocusFlow! 🚀

Here are the step-by-step instructions on how to run this project on your local machine.

## Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

## Running the Web App

1. **Open your terminal or command prompt**
   Navigate to the project folder where the application was created (`frontend` directory):
   ```bash
   cd "c:\Users\Dharanya\Documents\Time Waste Management\frontend"
   ```

2. **Install all dependencies**
   Before running the app for the first time, you must install the node modules used for plotting charts, routing, and providing the icons:
   ```bash
   npm install
   ```

3. **Start the development server**
   After the installation finishes, you can start up Vite (our fast development build tool):
   ```bash
   npm run dev
   ```

4. **View the website**
   Once you run the command, the terminal will give you a local URL (usually `http://localhost:5173/`). Hold `Ctrl` and click the link, or type it into your browser to view your beautifully designed Student Productivity app! 🎉

### What was updated:
- **Tailwind Removal**: The dependence on TailwindCSS has been entirely removed, as requested! The project now exclusively relies on completely customized Vanilla CSS inside `src/index.css`.
- **Aesthetic Refinements**: Navigation buttons now feature sleek line and slide hover animations. Glassmorphisms, glowing charts, and floating gradients were preserved!
- **Planner Added**: Included a new `Planner` route in the sidebar with a gorgeous Calendar and an iterative Task / To-Do Checklist component.
- **Charts visualization**: All statistical data maps natively into Recharts using `LineChart`, `BarChart`, `PieChart`, and even `RadarChart`! 
