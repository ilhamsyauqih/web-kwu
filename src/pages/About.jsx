import React from 'react';
import Layout from '../components/Layout';

const About = () => {
    return (
        <Layout>
            <div className="max-w-3xl mx-auto text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About Gedebog Chips</h1>

                <div className="prose prose-lg text-gray-600 mx-auto">
                    <p className="mb-6">
                        Welcome to Gedebog Chips, where innovation meets tradition. We transform the humble banana stem (Gedebog)
                        into a crispy, savory snack that's impossible to put down.
                    </p>
                    <p className="mb-6">
                        Our journey began with a simple idea: to create a sustainable snack using locally sourced ingredients.
                        By utilizing the banana stem, we're not only creating a unique product but also reducing waste and supporting local farmers.
                    </p>
                    <p>
                        We offer a variety of flavors to satisfy every palate, from our classic Original to the spicy Balado and savory Cheese.
                        Thank you for choosing Gedebog Chips!
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default About;
