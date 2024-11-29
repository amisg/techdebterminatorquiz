import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import QuizPage from "./components/QuizPage";
import ResultPage from "./components/ResultPage";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HeroSection />} />
				<Route path="/quiz" element={<QuizPage />} />
				<Route path="/results/:submissionId" element={<ResultPage />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
