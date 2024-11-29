import { useState } from "react";
import "../App.css";

function Form({ navigate, closeForm }) {
	const [formData, setFormData] = useState({
		firstname: "",
		lastname: "",
		email: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		localStorage.setItem("quizUserData", JSON.stringify(formData));
		navigate("/quiz");
	};

	return (
		<form onSubmit={handleSubmit} className="form">
			<button type="button" className="close-btn" onClick={closeForm}>
				&times;
			</button>
			<h2>Enter Your Details</h2>
			<div>
				<label htmlFor="firstname">First Name:</label>
				<input
					type="text"
					id="firstname"
					name="firstname"
					value={formData.firstname}
					onChange={handleChange}
					required
				/>
			</div>
			<div>
				<label htmlFor="lastname">Last Name:</label>
				<input
					type="text"
					id="lastname"
					name="lastname"
					value={formData.lastname}
					onChange={handleChange}
					required
				/>
			</div>
			<div>
				<label htmlFor="email">Email:</label>
				<input
					type="email"
					id="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
					required
				/>
			</div>
			<button type="submit">Start Quiz</button>
		</form>
	);
}

export default Form;
