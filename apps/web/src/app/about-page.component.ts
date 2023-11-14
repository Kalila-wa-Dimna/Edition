import {Component, ElementRef, Inject, PLATFORM_ID, Renderer2} from '@angular/core';
import {CONFIG_TOKEN, IConfig} from "@kalila-edition/common-ui";
import {ActivatedRoute} from "@angular/router";
import {FacsimileService} from "../../../../libs/section-manuscripts/src/lib/services/manuscript-data.service";
@Component({
  selector: 'kd-imprint-page',
  template: `
    <kd-layout>
      <span title>Kalila-wa-Dimna Edition</span>
      <main pageContent>
        <div class="about-content">
          <div class="side1">
            <div class="side1-content">
              <div class="paragraph-title">
              THE PROJECT
              </div>
              <div>
              <br>
              Kalīla and Dimna is a Book of Wisdom...<br>
              or “Mirror of Princes” in fable form, it is one of the key texts of world literature. The versions incorporate a multitude of different stories or episodes in varying combinations, origins may be traced back to Indian Sanskrit traditions, handed down via Persian, Syriac and Arabic. The Arabic versions originate in the 8th century when Arabic had become the <em>lingua franca</em> of the Near East. These then furnished the source of all further remodeling in different languages and cultures up to the 19th century and beyond.
              <br><br>
              Notwithstanding its great impact, <em>Kalīla and Dimna</em> is little known in the Western literary tradition of today. The work’s multilingual history of involving over forty languages has never been systematically studied. The absence of available research has made world literature largely ignore it, while scholars of Arabic avoided it because of its widely diverging manuscripts, so that the actual shape of the Arabic key version is still unknown.

              <br>
              <br>
              AnonymClassic, the ERC-funded research project hosted at Freie Universität Berlin, is the first-ever comprehensive study of the Kalīla and Dimna, its structure, its changes over time and its character as a carrier of cultural wisdom. A survey on the project and its activities is accessible via <a href="https://www.geschkult.fu-berlin.de/en/e/kalila-wa-dimna/index.html">the project homepage</a>.
              <br><br>One of the goals of the AnonymClassic project is to promote direct access to the manuscripts and their textual versions for Arabists, scholars of adjacent fields, as well as for general readers without knowledge of Arabic, thus contributing to a working environment for future endeavours. Our AnonymClassic Preview Edition is a pilot for how this access to <em>Kalīla and Dimna</em> may take shape.
              <br><br><em>Prof. Dr. Beatrice Gruendler, Principal Investigator AnonymClassic</em>
              <br>
              </div>

              <div>
                <br>
                <div class="paragraph-title">The AnonymClassic Preview Edition...</div><br>
                is based on the work by the AnonymClassic team of collecting text witnesses, transcribing, translating, and segmenting the <em>Kalīla and Dimna</em> manuscript data. This Preview Edition serves as a prototype for the project’s Digital Edition of Kalīla and Dimna.
                <br><br>
                The Preview Edition provides information on both the original manuscript versions via their facsimile digital copies (whenever legally available) as well as facilitating their reading by easily readable transcriptions in Arabic font. For non-specialist readers, we additionally provide a near-verbatim English translation, which imitates features of the original such as word order and line breaks whenever feasible.  In rendering each witness into English, we tried to replicate various formulations as they differed, whether by enlargement or abbreviation, from one witness to the next. As such, we signaled any additions, however small, any drops of words that affect the meaning of sentences, and any individual words whose connotation changes according to the combinations in which they appear. In all instances, we have tried to remain close to each version as it was produced, with minimal emendation, so that the reader of the synoptic edition can compare the individual choices across the witnesses both in Arabic and in English.
                <br>
                <br>
                The main tool for analysis, however, is the literary segmentation into small semantic units. These units may vary in length from a couple of words to a short paragraph. The segmentation allows for systematic insights into the structure and individual character of each manuscript version. It also provides a basis for historical analyses and comparative study of the interrelations of these versions.
                <br>
                A list of all possible segments is provided, as well as a survey of segments present in each single version: none of the versions known contain all segments, most of them feature between two thirds to three quarters of the choices. Segment numbers are clearly marked in red in the transcriptions and translations.
                <br><br>
                The Preview Edition shows a very small section of the work – yet. At half-term through the project’s duration, the Berlin team has been able to collect 94 manuscripts of <em>Kalīla and Dimna </em>in digitized form. We have analyzed over 20,000 manuscript pages in order to study the changing structure of the book, to observe the characteristics of the text, and to identify near verbatim copies, which are actually relatively uncommon in the corpus but show the popularity of particular versions. More than 2,500 manuscript pages were fully transcribed by the team, and segmented into textual units.


              </div>

              <!-- Your content goes here -->
            </div>
          </div>
          <div class="side2">
            <div class="side2-content">
              <div> <br><br>
                In the future, a more representative spectrum of this vast corpus will be made accessible via the project’s online portal. We currently are experimenting with models for gathering feedback of scholars and the public worldwide.
                Further contributors supporting the Berlin team via transcribing and/or providing English translations on a volunteer basis are highly welcome. Please contact us for registration if you wish to participate: anonymclassic&#64;geschkult.fu-berlin.de.
              </div><br>
              <div class="paragraph-title">
                The Digital Edition of AnonymClassic...</div>
                <div>
                  <br>
                  is both the core and the showcase of project work. It also anchors the long-term perspective of the research project initiated via the European Research Council and the funding received through the Advanced Grant (2018-2022), carrying its efforts forth into the academic and literary community.
                </div>
                <br>
            <div>
              <div class="paragraph-title">The European Research Council (ERC)...</div>
              <br>
              in a nutshell: The <a href="https://erc.europa.eu" >European Research Council</a>, set up by the EU in 2007, is the premiere European funding organisation for excellent frontier research. Every year, it selects and funds the very best, creative researchers of any nationality and age, to run projects based in Europe. The ERC offers four core grant schemes: Starting, Consolidator, Advanced and Synergy Grants. With its additional Proof of Concept grant scheme, the ERC helps grantees to bridge the gap between grantees’ pioneering research and early phases of its commercialisation.
            </div>
              <br>
              <br>
              <div class="paragraph-title">
                Freie Universität Berlin and its Faculty of History and Cultural Studies... </div>
              <br>
              <div>
                offers a research profile found nowhere else in Germany. It covers a wide range of different eras, from antiquity to the modern period, and a vast physical area, stretching from Europe and the Middle East to Asia and the Americas. This results in a diverse and inspiring range of activities both within and across individual disciplines. The <a href="https://www.fu-berlin.de/en/einrichtungen/fachbereiche/fb/gesch-kultur/index.html">Faculty</a> highly benefits by the Status of Excellency of Freie Universität Berlin within the Berlin University Alliance.
                <br><br>
                The <a href="https://www.berlin-university-alliance.de/en/index.html">Berlin University Alliance</a> founded in 2019 reunites four Berlin institutions to form an integrated research environment and one of Europe’s leading academic hubs. By crossing boundaries of personal networks, institutions, and disciplines, the Alliance means an outstanding ecosystem of universities and other research institutes, scientific collections, museums, cultural and political institutions and further partners. Issues such as fostering a Berlin-centered network of research and knowledge exchange, or bundling expertise for research data management or advancing strategic internationalization are highly favourable to AnonymClassic’s goals.

                <br><br>
              </div>
              <div class="text-image-container">
                <!--<div class="img-container">
                  <img [src]="manuscriptEndPoint + 'about/about1.jpg'" alt="Image Description" class="img-sty">
                </div>-->
                <div class="text-container">
                  <br >

                  <!-- Add more text content here -->
                </div>
              </div>
              <!-- Your content goes here -->
            </div>
          </div>
        </div>

      </main>
    </kd-layout>
  `,
  styleUrls: ['./about-page.component.scss'],
})
export class AboutPageComponent {


  manuscriptEndPoint = this.config.imagesEndPoint + 'manuscripts/';

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {
  }
}

