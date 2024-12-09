import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './Translator.css';
import UserHeader from './Header/UserHeader';
import languages from './Data';

const Translator = () => {
    useEffect(() => {
        document.title = 'Tekmiz - Language Translator';
    }, []);

    const [textToTranslate, setTextToTranslate] = useState('');
    const [fromLanguage, setFromLanguage] = useState('');
    const [toLanguage, setToLanguage] = useState('');
    const [translatedText, setTranslatedText] = useState('');

    const languageOptions = useMemo(() => languages, []);

    const translateText = useCallback(async (text, fromLang, toLang) => {
        const url = 'https://google-translate113.p.rapidapi.com/api/v1/translator/text';
        const data = JSON.stringify({
            from: languageOptions[fromLang] || 'auto', // default to 'auto' if fromLang is not available
            to: languageOptions[toLang] || 'en',
            text: text,
        });
    
        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': '53335ef937msh1e452d2a916b013p168a60jsn1bae19569914',
                'x-rapidapi-host': 'google-translate113.p.rapidapi.com',
                'Content-Type': 'application/json',
            },
            body: data,
        };
    
        try {
            const response = await fetch(url, options);
            const result = await response.json();
    
            // Debugging: Log the result to see the actual structure
            // console.log('API Response:', result);
    
            // Update to handle the new response format
            if (result && result.trans) {
                setTranslatedText(result.trans);
            } else {
                console.error('Unexpected response format:', result);
            }
        } catch (error) {
            console.error('Translation error:', error);
        }
    }, [languageOptions]);
    
    

    useEffect(() => {
        if (textToTranslate && fromLanguage && toLanguage) {
            translateText(textToTranslate, fromLanguage, toLanguage);
        }
    }, [textToTranslate, fromLanguage, toLanguage, translateText]);

    return (
        <>
            <UserHeader />
            <div className="translator">
                <div className="container">
                    <h1 className="start-h1">Language Translator</h1>
                    <div className='translator_property'>
                        <div className='nuv_item'>
                            <select id="lang1" value={fromLanguage} onChange={(e) => setFromLanguage(e.target.value)}>
                                <option value="">Select From Language</option>
                                {Object.keys(languageOptions).map((language) => (
                                    <option key={language} value={language}>
                                        {language}
                                    </option>
                                ))}
                            </select>
                            <select id="lang2" value={toLanguage} onChange={(e) => setToLanguage(e.target.value)}>
                                <option value="">Select To Language</option>
                                {Object.keys(languageOptions).map((language) => (
                                    <option key={language} value={language}>
                                        {language}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='write_box'>
                        <textarea
                            id="fname"
                            value={textToTranslate}
                            onChange={(e) => setTextToTranslate(e.target.value)}
                            placeholder="Enter the text to translate"
                            className='Property_from'
                        />
                        <textarea
                            id="sname"
                            value={translatedText}
                            placeholder="Translated Text will appear here"
                            readOnly
                            className='Property_trans'
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Translator;