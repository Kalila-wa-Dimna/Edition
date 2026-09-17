import {Component, Inject} from '@angular/core';
import {CONFIG_TOKEN, IConfig} from "@kalila-edition/common-ui";

@Component({
    selector: 'kd-imprint-page',
    template: `
    <kd-layout>
      <span title>Kalila-wa-Dimna Edition</span>
      <main pageContent>
        <div class="imprint-containt">
          <div class="side1">
            <div class="side1-content">
              <div class="paragraph-title">
                IMPRINT
              </div>
              <div>
                <br>
                A prototype of the present collations was developed as a MSc thesis project in Technische Informatik – Embedded Systems at Berliner Hochschule für Technik under supervision of  <a href="https://prof.beuth-hochschule.de/forler/"> Prof. Dr. Ch. Forler </a>(Fachbereich VI – Informatik und Medien) in cooperation with Freie Universität Berlin, <a href="https://www.geschkult.fu-berlin.de/e/semiarab/arabistik/Seminar/Mitarbeiterinnen-und-Mitarbeiter/Professuren/Gruendler/"> Prof. Dr. B. Gruendler </a> (Arabic Studies, Principal Investigator AnonymClassic/Arabic Literature Cosmopolitan).
                 <br><br>
                Concept, layout, and development was by Marwa M. Ahmed. The present edition was co-developed by Marwa M. Ahmed and Mahmoud M. Kozae and is documented by an a MA thesis project under supervision of Prof. Dr. B. Gruendler.
                <br>
                <br>
                <div class="paragraph-title">
                Edition team
                  <br>
                </div>
                  <br>
                Transcriptions of Arabic manuscript originals by: AnonymClassic/Arabic Literature Cosmopolitan team: Khouloud Khalfallah, Rima Redwan,
                Mahmoud Kozae, Heba Tebakhi, Dima M. Sakran, Oualid El Khattabi and Hala Abedalhadi.

                <br>
                  <br>English text versions translated by: Oualid El Khattabi, AnonymClassic/Arabic Literature Cosmopolitan.
                  <br>The editions and collation of one chapter features near-verbatim translations into English, closely following the original versions for philological objectives, we are much indebted to <a href="https://www.geschkult.fu-berlin.de/en/e/kalila-wa-dimna/partners/index.html">Dr. M. Fishbein</a> and his literary English translations of the “Kalīla and Dimna” episodes.
               </div>

              <div>
                <br>
                <div class="paragraph-title">Usage agreements </div>
                <br>
                License agreements for manuscript digital copies featured in the Preview Edition are being handled individually with each library or archive.<br> A number of manuscripts are freely accessible online via <a href="https://gallica.bnf.fr/accueil/en/content/accueil-en?mode=desktop"> Bibliothèque nationale de France Gallica</a>, or the online services <a href="https://digital.bodleian.ox.ac.uk/"> Digital Bodleian</a>, Bodleian Libraries, University of Oxford, or the online service of <a href="https://parker.stanford.edu/parker"> Parker Library</a> On The Web. Manuscripts in the Parker Library at Corpus Christi College, Cambridge.
                  <li>  Paris arabe 3465: <a href="https://gallica.bnf.fr/ark:/12148/btv1b84229611/f13.item">https://gallica.bnf.fr/ark:/12148/btv1b84229611/f13.item.</a></li>
                  <li > Paris arabe 3466: <a href="https://gallica.bnf.fr/ark:/12148/btv1b10329769c/f2.item.r=kalila "> https://gallica.bnf.fr/ark:/12148/btv1b10329769c/f2.item.r=kalila.</a></li>
                  <li> Paris arabe 3471: <a href="https://gallica.bnf.fr/ark:/12148/btv1b10515457s/f2.item.r=kalila "> https://gallica.bnf.fr/ark:/12148/btv1b10515457s/f2.item.r=kalila.</a></li>
                  <li> Oxford, Bodleian, Pockocke 400: <a href="https://digital.bodleian.ox.ac.uk/objects/8face4cc-d7dc-4ec6-8315-64b8c171dd76/">https://digital.bodleian.ox.ac.uk/objects/8face4cc-d7dc-4ec6-8315-64b8c171dd76/.</a></li>
                  <li> Cambridge CC Parker 578: <a href="https://parker.stanford.edu/parker/catalog/yg734tn1217">https://parker.stanford.edu/parker/catalog/yg734tn1217.</a></li>

                <br>
                The publication of select digitized images of the following manuscripts have been made possible by the following licenses and permissions:
                <li>  Pococke 400: ©Bodleian Libraries, University of Oxford, Terms of use: <a href="https://creativecommons.org/licenses/by-nc/4.0/"> Creative Commons CC-BY-NC 4.0 license </a> </li>
                <li> Riyadh 2536: King Faisal Center for Research and Islamic Studies, Riyadh (pending).  </li>
                <li> Ayasofya 4095: With kind permission by Türkiye Yazma Eserler Kurumu Başkanlığı, Süleymaniye Yazma Eser Kütüphanesi, Ayasofya Koleksiyonu, 4095, 223b-226b </li>
                <br>We thank Dr. Rainer Brömer and Hakan Dağıstanlı for their valuable support.

              </div>

              <!-- Your content goes here -->
            </div>
          </div>
          <div class="side2">
            <div class="side2-content">
              <div class="paragraph-title">
                The Kalīla and Dimna
              </div>
              AnonymClassic Project/Arabic Literature Cosmopolitan
              <br>
              <br> hosted at Freie Universität Berlin
              <br> has received funding from the European Research Council (ERC) and from the German Research Foundation (DFG)
              <br> under the European Union's Horizon 2020 research and innovation programme,
              <br> grant agreement No 742 635.
              <br>   <br>
              <div class="paragraph-title">
                Contact</div>
              <div>
                <br>
                <a href="https://www.geschkult.fu-berlin.de/en/e/kalila-wa-dimna/index.html">Kalīla and Dimna ‒ AnonymClassic </a>(2018-2023)<br> Freie Universität Berlin <br> Fachbereich Geschichts- und Kulturwissenschaften <br> Seminar für Semitistik und Arabistik <br> Fabeckstraße 23/25, 14195 Berlin-Dahlem
              </div>
              <br>
              <div class="text-image-container">
                <div class="img-container">
                  <img [src]="manuscriptEndPoint + 'about/about2.png'" alt="Image Description" class="img-sty">
                </div>
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
    styleUrls: ['./imprint-page.component.scss'],
    standalone: false
})
export class ImprintPageComponent {

  manuscriptEndPoint = this.config.imagesEndPoint + 'manuscripts/';
  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
  ) {
  }
}
