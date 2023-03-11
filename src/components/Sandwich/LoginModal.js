import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useSandwich } from "../../hooks/";

import { SandwichCard, Modal } from "../";

const SandwichModal = ({ closeLink = "" }) => {
    const [isModalLoading, setIsModalLoading] = useState(true);
    const { sandwichId } = useParams();
    const { sandwich, ingredientTypes, ingredients, fetchSandwich } = useSandwich();

    useEffect(() => {
        (async () => {
            await fetchSandwich(sandwichId);
            setIsModalLoading(false);
        })();
    }, [fetchSandwich, sandwichId]);

    return (
        <Modal isModalLoading={isModalLoading} closeLink={closeLink}>
            <SandwichCard
                isModal
                key={sandwichId}
                index={Math.ceil(Math.random() * 4)}
                sandwich={sandwich}
                ingredientTypes={ingredientTypes}
                ingredients={ingredients}
            />
        </Modal>
    );
};

export default SandwichModal;




<div class="max-w-screen-md text-white text-center">
    <!--<h1 class="text-magenta font-bold text-2xl md:text-4xl xl:text-5xl uppercase mb-3 md:mb-5">Have you built a winner?</h1>
    <h4 class="text-base md:text-xl xl:text-3xl">Now fill out this quick form and you’re done!</h4>-->
	<h1 class="text-magenta font-bold text-2xl md:text-4xl xl:text-5xl uppercase mb-3 md:mb-5">Want to show the world your masterpiece?</h1>
	<h4 class="text-base md:text-xl xl:text-3xl">The competition is now closed, but you can still build your perfect creation and share it to our gallery!</h4>
	
    <form g-ref="EntryForm:form" class="needs-validation text-left text-sm mt-15 md:mt-20 xl:mt-24 md:px-5" method="post">
      <div class="mb-4 md:mb-6">
        <input g-ref="EntryForm:firstnameInput" class="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20" name="first_name" type="text" maxlength="15" placeholder="First name" required="">
        <p class="error-message hidden text-gray-300 text-xs py-2">Please fill in this field.</p>
      </div>
      
      <!--<div class="mb-4 md:mb-6">
        <input g-ref="EntryForm:emailInput" class="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20" name="email" type="email" placeholder="E-mail address" required>
        <p class="error-message hidden text-gray-300 text-xs py-2">Please fill in this field.</p>
      </div>-->     
      
      <div class="mb-4 md:mb-6 relative">
        <select g-ref="EntryForm:countySelect" class="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20" name="county" required="">
          <option value="" disabled="" selected="">County</option>
                      <option value="carlow">Carlow</option>
                      <option value="cavan">Cavan</option>
                      <option value="clare">Clare</option>
                      <option value="cork">Cork</option>
                      <option value="donegal">Donegal</option>
                      <option value="dublin">Dublin</option>
                      <option value="galway">Galway</option>
                      <option value="kerry">Kerry</option>
                      <option value="kildare">Kildare</option>
                      <option value="kilkenny">Kilkenny</option>
                      <option value="laois">Laois</option>
                      <option value="leitrim">Leitrim</option>
                      <option value="limerick">Limerick</option>
                      <option value="longford">Longford</option>
                      <option value="louth">Louth</option>
                      <option value="mayo">Mayo</option>
                      <option value="meath">Meath</option>
                      <option value="monaghan">Monaghan</option>
                      <option value="offaly">Offaly</option>
                      <option value="roscommon">Roscommon</option>
                      <option value="sligo">Sligo</option>
                      <option value="tipperary">Tipperary</option>
                      <option value="waterford">Waterford</option>
                      <option value="westmeath">Westmeath</option>
                      <option value="wexford">Wexford</option>
                      <option value="wicklow">Wicklow</option>
                  </select>
        <div class="select__arrow pointer-events-none absolute top-0 bottom-0 right-0 flex items-center py-2 pl-2 pr-4 md:pr-6 xl:py-3 xl:pr-8 text-magenta">
          <svg class="fill-current w-auto h-3 xl:h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path d="M2 0L0 2h4zm0 5L0 3h4z"></path></svg>
        </div>
        <p class="error-message hidden text-gray-300 text-xs py-2">Please select an item from this list.</p>
      </div>
      
      <!--<div class="mb-4 md:mb-6">
        <input g-ref="EntryForm:burgernameInput" class="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-base xl:text-xl py-2 px-4 md:px-6 xl:py-3 xl:px-8 xl:box-shadow-20" name="burger_name" type="text" maxlength="30" placeholder="Burger name" required>
        <p class="error-message hidden text-gray-300 text-xs py-2">Please fill in this field.</p>
      </div>-->
      
      <div class="mb-4 md:mb-6 custom-control custom-checkbox">
        <input g-ref="EntryForm:agreeRadio" class="custom-control-input" id="termsCheckbox" type="checkbox" name="tc_agreed" value="1" required="">
        <label class="custom-control-label" for="termsCheckbox">
          <span>I agree to the <a href="#modal-terms" class="text-magenta hover:underline">Terms &amp; Conditions</a> and <a href="#modal-privacy" class="text-magenta hover:underline">Privacy Policy</a></span>
        </label>
        <p class="error-message hidden text-gray-300 text-xs py-2">Please tick this checkbox.</p>
      </div>
      
      <button g-ref="EntryForm:submitBtn" type="submit" class="w-full inline-flex justify-center items-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white h-8 md:h-12 xl:h-14 text-sm md:text-base xl:text-xl py-2 px-5 md:py-3 md:px-6 xl:px-8 xl:box-shadow-20">
        <span>Enter</span>
      </button>
    </form>
  </div>