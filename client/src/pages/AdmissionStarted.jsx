import React, { useEffect, useState } from "react";
import Axios from "../Axios";
import { DISTRICT } from "../Consts";

function AdmissionStarted() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState([]);
  const getBranches = async () => {
    try {
      let { data } = await Axios.get(`/study-centre?district=${selectedBranch}`);
      console.log(data);
      setBranches(data.docs);
    } catch (error) {
      console.log(error.response);
    }
  };
  useEffect(() => {
    getBranches();
  }, [selectedBranch]);
  return (
    <div className="isolate bg-gray-900">
      <main>
        <div className="relative px-6 lg:px-8">
          <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
            {/* <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full py-1 px-3 text-sm leading-6 text-white ring-1 ring-blue-900/10 hover:ring-blue-900/20">
              About Us
            </div>
          </div> */}
            <div className="">
              <h1 className="text-xl font-bold  text-[#2ab38e] sm:text-6xl">
                {/* Centre for Public Education and Training (CPET)  */}
                Admission Started
              </h1>
              <p
                className="mt-6 text-lg  leading-8 text-white"
                style={{
                  fontFamily: "MalayalamFont, sans-serif",
                }}
              >
                <b>🎓 മഹ്ദിയ്യ കോഴ്സ് 🎓</b> <br />
                ദാറുൽഹുദാ ഇസ്‌ലാമിക് യൂനിവേഴ്സിറ്റി പൊതു വിദ്യാഭ്യാസ വിഭാഗം
                CPET(Centre for Public Education and Training) ന് കീഴിൽ 2016 ൽ
                പെൺകുട്ടികൾക്കായി തുടക്കം കുറിച്ച പാഠ്യ പദ്ധതിയാണ് മഹ്ദിയ്യ
                കോഴ്സ്.
                <br />
                <b>ലക്ഷ്യം.... </b>
                <br />
                വളർന്നുവരുന്ന വിദ്യാർത്ഥിനികൾക്ക് അവരുടെ ബൗദ്ധിക പഠനത്തോടൊപ്പം
                തന്നെ മത വിദ്യാഭ്യാസവും നൽകുന്നതിലൂടെ മതബോധമുള്ളവരും
                ലക്ഷ്യബോധമുള്ളവരുമായ സ്ത്രീ സമൂഹത്തെ സജ്ജമാക്കുക എന്നതാണ്.
                <br />
                <b> അഡ്മിഷൻ </b>
                <br />
                SSLC കഴിഞ്ഞ് തുടർപഠന യോഗ്യതയുള്ള പെൺകുട്ടികൾക്ക് കോഴ്സിൽ
                ചേരാവുന്നതാണ്.
                <br />
                <b>കോഴ്സ് കാലാവധി.... </b>
                <br />
                അഞ്ചു വർഷമാണ് കോഴ്സ്. ഹയർ സെക്കണ്ടറി (+1,+2) പഠനത്തോടൊപ്പം 2
                വർഷത്തെ സർട്ടിഫിക്കേറ്റ് കോഴ്സും CMS (Certificate in Moral
                Studies) തുടർന്ന് നിശ്ചിത സ്ഥാപനങ്ങളിൽ മൂന്ന് വർഷത്തെ തുടർ
                പഠനവും നൽകുന്നു, മൂന്ന് വർഷത്തെ കോഴ്സ് പൂർത്തീകരിക്കുന്നവർക്ക്
                മഹ്ദിയ്യ ബിരുദവും നൽകുന്നു.
                <br />
                <b> പാഠ്യ പദ്ധതി....</b> <br />
                വിവിധ വിഷയങ്ങളിൽ ഹയർ സെക്കൻഡറി, ഡിഗ്രി പഠനത്തോടൊപ്പം ഇസ്‌ലാമിക
                വിഷയങ്ങളിൽ സാമാന്യ പരിജ്ഞാനം നൽകുന്ന രീതിയിലാണ് കോഴ്സ്
                സജ്ജീകരിച്ചിട്ടുള്ളത്. ഖുർആൻ, തഫ്സീർ, ഹദീസ്, കർമശാസ്ത്രം, അഖീദ,
                തജ്‌വീദ്, കുടുംബ ശാസ്ത്രം, തരീഖ് തസവ്വുഫ്, നഹ് വ്, സ്വർഫ്
                തുടങ്ങിയ വിഷയങ്ങളും ജനറൽ സബ്ജക്ടും അടങ്ങിയതാണ് പാഠ്യപദ്ധതി.
                വിവിധ ട്രെയിനിങ് പ്രോഗ്രാമുകളും പഠന ക്ലാസ്സുകളും കലാമത്സരങ്ങളും
                മറ്റും കോഴ്സിൻ്റെ ഭാഗമാണ്. ഭൗതിക പഠനം ഹയർ സെക്കണ്ടറി തലത്തിലെ
                വിവിധ വിഷയങ്ങളും, യുജിസി അംഗീകൃത യൂനിവേഴ്സിറ്റികളിൽ നിന്നും
                ഡിഗ്രിയുമാണ്.
                <br />
                <b>പരീക്ഷ </b>
                <br />
                മത വിഷയങ്ങളിൽ ദാറുൽ ഹുദാ പരീക്ഷാ ഭവൻ നേരിട്ടും ഭൗതിക വിഷയങ്ങളിൽ
                സർക്കാർ, യൂനിവേഴ്സിറ്റി പരീക്ഷകളുമായിരിക്കും.. വർഷത്തിൽ രണ്ട്
                സെമസ്റ്റർ പരീക്ഷകളാണുള്ളത്. ഓരോ സെമസ്റ്ററിലും CCE വർക്കുകളും
                മൂല്യനിർണയവും നടക്കുന്നു.....
                <br />
                <b>സ്റ്റഡി സെൻ്ററുകൾ</b>
                <br />
                സംസ്ഥാനത്തെ വിവിധ ജില്ലകളിലായി അറുപത്തി അഞ്ചിലധികം സ്റ്റഡി
                സെൻ്ററുകളുണ്ട്.
                <br />
                ------------------------
                <br />
                🌐 www.cpetdhiu.in <br />
                📧 cpet@dhiu.in <br />
                ☎91 9746 2295 47 <br />
                <br />
                FOR ADMISSION <br />
                cpetdhiu.in <br />
                ---------------------------- <br />
                CPET DARUL HUDA
              </p>
              <div className="lg:col-span-1">
                <label
                  className="block  text-sm my-4 font-bold mb-2"
                  htmlFor="username"
                >
                  Which district you prefer for your campus ?
                </label>

                <select
                  name="branch"
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  id=""
                  className="bg-gray-900 mb-4 border border-gray-300 text-[#eeeeee] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                >
                  <option hidden>Select </option>
                  {DISTRICT.map((district, index) => (
                    <>
                      <option key={index} value={district}>
                        {district}
                      </option>
                    </>
                  ))}
                </select>
              </div>
              <div className="lg:grid lg:grid-cols-3 gap-2">
                {branches.length > 0 &&
                  branches.map((item, index) => (
                    <div className="block max-w-sm p-6 bg-gray-900 border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                      <p className="mb-2  font-semibold tracking-tight text-white dark:text-white">
                        {item?.studyCentreName}
                      </p>
                      <p className="font-normal text-gray-700 dark:text-gray-400">
                        {item?.phone}
                      </p>
                      <p className="font-normal text-gray-700 dark:text-gray-400">
                        {item?.district}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="flex items-center mt-3 justify-center gap-x-6 mb-7">
                <a
                  href="/add-student"
                  target={"_blank"}
                  className="rounded-md bg-[#2a95b3] px-3.5 py-1.5 text-base font-semibold leading-7 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Register Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdmissionStarted;
