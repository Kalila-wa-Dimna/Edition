import { Component, Inject } from '@angular/core';
import { CONFIG_TOKEN, IConfig } from '@kalila-edition/common-ui';
import { Router } from '@angular/router';

@Component({
  selector: 'kd-main-page',
  template: `
    <kd-layout [dataManuscriptEndPoint]="manuscriptEndPoint">
      <span title
        >Kalīla wa-Dimna Edition
        <span class="version-number">(v.{{ version }})</span></span
      >
      <main pageContent>
        <div class="box1">
          <img
            class="kwd"
            src="{{ manuscriptEndPoint + 'about/KWD.jpg' }}"
            alt="Box 2 Image"
          />
          <div class="content1">
            <img
              class="logo-img"
              src="{{ manuscriptEndPoint + 'about/KD-Edition-Logo.png' }}"
              alt="Box 2 Image"
            />
            <p>
              <span class="box-title">THE EDITION</span><br /><br />
              Catching a Book on the Move: <i>Kalīla and Dimna</i> is one of the
              key texts of world literature. <br />
              The numerous versions of this Book of Wisdom or “Mirror of
              Princes” in fable form incorporate a multitude of different
              stories or episodes in varying combinations. <br /><br />
              Origins may be traced back to Indian Sanskrit traditions, handed
              down via Persian and Syriac. The Arabic versions originate in the
              8th century when Arabic had become the <i>lingua franca</i> of the
              Near East; these then furnished the source of all further
              remodeling in different languages and cultures up to the 19th
              century and beyond.
              <span
                *ngIf="!showMore"
                (click)="showMore = true"
                style="cursor: pointer; color: blue"
                >... read more</span
              >

              <ng-container *ngIf="showMore">
                Notwithstanding its great impact, <i>Kalīla and Dimna</i> is
                little known in the Western literary tradition of today. Before
                the Berlin research project, the work’s multilingual history
                involving over forty languages had not been systematically
                studied. The absence of available research has thus made world
                literature largely ignore it, while scholars of Arabic avoided
                tackling its widely diverging manuscripts: its key nature as a
                <b>textual tradition</b>, rather than one single work, has only
                recently been grasped. <br /><br />
                The <i>Kalīla and Dimna</i> research project hosted at Freie
                Universität Berlin (AnonymClassic, the ERC-funded first stage,
                2018-2023 and Arabic Literature Cosmopolitan, the DFG Leibniz
                Prize-funded second stage 2022-2027), is the first-ever
                comprehensive study of <i>Kalīla and Dimna</i>, its structure,
                its changes over time, and its character as a carrier of
                transcultural wisdom. A survey on the project and its activities
                is accessible via the project homepage (for further detail see
                the chapter by Rima Redwan in Gruendler and Toral, eds.,
                <i>An Unruly Classic</i>, Leiden and Boston 2024,
                <a href="https://brill.com/edcollbook/title/64276" target="_blank"
                  >https://brill.com/edcollbook/title/64276</a
                >). <br /><br />
                One of the goals of the <i>Kalīla and Dimna</i> research project
                is to promote direct access to the manuscripts and their textual
                versions. This is meant for Arabists, scholars of adjacent
                fields, and general readers without knowledge of Arabic alike,
                thus contributing to a working environment for future endeavors.
                A representative spectrum of the vast corpus has now been made
                accessible via the project’s online portal. <br /><br />
                The Edition is both the core and the showcase of project work. It
                anchors the long-term perspective of the research project
                carrying its efforts forth into the academic and literary
                community. <br /><br />
                <i>Beatrice Gruendler, Principal Investigator,</i><br />
                <i>with her team and collaborating partners:</i><br />
                <br />
                <div class="team-names">
                  <span>Hala Abdalhadi</span>
                  <span>Eman S. A. Abd Elatif</span>
                  <span>Aliaa Ahmed</span>
                  <span>Marwa M. Ahmed</span>
                  <span>Doğa Akpinar</span>
                  <span>Theodore S. Beers</span>
                  <span>Samer Ben Brahim</span>
                  <span>Vasiliki Chamourgiotaki</span>
                  <span>Yoones Dehghani Farsani</span>
                  <span>Oualid El Khattabi</span>
                  <span>Yousri A. M. Elseadawy</span>
                  <span>Nesma El Sayed Mousa</span>
                  <span>Asmaa Essakouti</span>
                  <span>Ingrid A. Evans</span>
                  <span>Michael Fishbein</span>
                  <span>Jan J. van Ginkel</span>
                  <span>Mathea Glaubitz</span>
                  <span>Lilli Hölzlhammer</span>
                  <span>Jens Inden</span>
                  <span>Ulrich Marzolph</span>
                  <span>Kierán Meinhardt</span>
                  <span>Victoria Mummelthei</span>
                  <span>Claudia Paeffgen</span>
                  <span>Ruslan Pavlyshyn</span>
                  <span>Rachel Peled Cuartas</span>
                  <span>Markus Pöckelmann</span>
                  <span>Isla Karademir</span>
                  <span>Matthew L. Keegan</span>
                  <span>Khouloud Khalfallah</span>
                  <span>Agnes Kloocke</span>
                  <span>Mahmoud Kozae</span>
                  <span>Rima Redwan</span>
                  <span>Dima M. Sakran</span>
                  <span>Ignacio Sánchez</span>
                  <span>Albert Schlosser</span>
                  <span>Florinda di Simini</span>
                  <span>Johannes Stephan</span>
                  <span>Heba Tebakhi</span>
                  <span>Ramona Teepe</span>
                  <span>Isabel Toral</span>
                  <span>Alice Woolston</span>
                </div>
                <span
                  (click)="showMore = false"
                  style="cursor: pointer; color: blue; display: block; margin-top: 5px"
                  >Read less</span
                >
              </ng-container>
            </p>
            <!-- <button (click)="navigateTo('/about')">About the project</button>-->
          </div>
        </div>
        <div class="container-boxes">
          <!-- Box 1 -->
          <div class="box">
            <div class="content">
              <img
                src="{{ manuscriptEndPoint + 'about/manuscript.png' }}"
                alt="Box 1 Image"
              />
              <p class="box-title">MANUSCRIPTS</p>
              <p>
                The Edition shows a part of the work – yet. It will further grow
                over time. The Berlin team has been able to collect 121 Arabic
                and Persian manuscripts of <i>Kalīla and Dimna</i> in digitized
                form. We have analyzed thousands of manuscript pages in order to
                study the changing structure of the book, to observe the
                characteristics of the text, and to identify strands of the
                textual tradition (groups or continua), collages, or
                near-verbatim copies.
                <span
                  *ngIf="!showMoreManuscripts"
                  (click)="toggleReadMoreManuscripts()"
                  style="cursor: pointer; color: blue"
                  >...read more</span
                >
              </p>
              <span *ngIf="showMoreManuscripts">
                Over 3,000 manuscript pages were fully transcribed by the team,
                and segmented into textual units. Those manuscripts most
                suitable to illustrate the textual tradition
                <i>Kalīla and Dimna</i> in its spectrum of variation are shown
                here as facsimile digital copies (whenever legally available) and
                as transcriptions in Arabic font facilitating their reading. For
                the chapter of The <i>Cat and the Rat</i> (abbreviated Mc) an
                English translation is given.
                <span
                  (click)="toggleReadMoreManuscripts()"
                  style="cursor: pointer; color: blue; display: block; margin-top: 5px"
                  >Read Less</span
                >
              </span>
              <button (click)="navigateTo('/manuscripts')">View</button>
            </div>
          </div>

          <div class="box">
            <div class="content">
              <img
                src="assets/images/home-collation.png"
                alt="Collations screenshot"
              />
              <p class="box-title">COLLATIONS</p>
              <p>
                The <i>Kalīla and Dimna</i> Edition is based on countless hours
                of work by the research team of collecting text witnesses,
                transcribing, translating, and segmenting the
                <i>Kalīla and Dimna</i> manuscript data. We originally started
                out with a small chapter (The <i>Cat and the Rat</i>, abbreviated
                Mc) in just seven different manuscript versions.
                <span
                  *ngIf="!showMoreCollations"
                  (click)="toggleReadMoreCollations()"
                  style="cursor: pointer; color: blue"
                  >...read more</span
                >
              </p>
              <span *ngIf="showMoreCollations">
                Meanwhile, the Edition has expanded to include prefaces (or
                frame narratives), the table of contents (which appears in
                various places within the corpus), and several chapters. Each of
                these is presented in the Edition as a
                <b>synoptic collation of multiple versions</b>, running up to
                fifteen manuscripts side by side, and selected to show the
                maximal textual variation. In addition, the exact composition of
                manuscripts per collation varies, since the relation among
                manuscript versions differs to a certain degree in each chapter.
                <br /><br />
                The main tool for analysis of each collation is the literary
                <b>segmentation</b> into <b>semantic units</b>. These units or
                segments may vary in length from a couple of words to a short
                paragraph. Segments are numbered, and each has a unique label.
                The segmentation allows for systematic insights into the
                structure and individual character of each manuscript version. It
                also provides a basis for historical analysis and comparative
                study of the interrelations of these versions.
                <b>A list of all segments</b> per chapter is provided for
                download, as well as a survey of the segments present in each
                single version: none of the versions contains all of these
                segments, most of them feature between two thirds and three
                quarters. <br /><br />
                <span
                  (click)="toggleReadMoreCollations()"
                  style="cursor: pointer; color: blue; display: block; margin-top: 5px"
                  >Read less</span
                >
              </span>
              <button (click)="navigateTo('/collations')">View</button>
            </div>
          </div>

          <div class="box">
            <div class="content">
              <img
                src="{{ manuscriptEndPoint + 'about/manuscript_description.png' }}"
                alt="Box 4 Image"
              />

              <p class="box-title">MANUSCRIPT DESCRIPTIONS</p>
              <p>
                The Edition provides detailed information on those manuscripts
                used most often in our edition. The information includes
                <b>codicological data</b> (date, physical description, layout,
                and illustrations), as well as notes on the <b>script</b> and
                <b>orthography</b> and a manuscript's
                <b>placement within the textual tradition</b>.
                <span
                  *ngIf="!showMoreManuscriptsDescription"
                  (click)="toggleReadMoreManuscriptsDescription()"
                  style="cursor: pointer; color: blue"
                  >... read more</span
                >
              </p>
              <span *ngIf="showMoreManuscriptsDescription">
                The script is defined according to its proportions, since the
                script type is mostly <i>naskh</i> (except for a few manuscripts
                in Maghribī and Garshuni script). The orthography is of
                interest, since it gives hints about the copyist or redactor and
                shows a varying degree of Middle Arabic features. Each
                manuscript’s affiliation in regard to its strand of the
                tradition is given, such as the early group of manuscripts or
                the continua. <br /><br />
                Some manuscripts are collages of several versions, which we call
                cross-copies. Other manuscripts are idiosyncratic. Near-verbatim
                copies of extant models have only been included if the older
                model is incomplete (thus Paris 3475 replaces Rabat 3655) or the
                later copy has been enriched (Paris 5881 is illustrated vs. its
                model Ayasofya 4214 is not). <br /><br />
                For a full list of the manuscripts used in the project, see
                <a
                  href="https://www.zotero.org/groups/2293760/anynomclassic/library"
                  target="_blank"
                >
                  https://www.zotero.org/groups/2293760/anynomclassic/library
                </a>
                and for the manuscripts’ interrelation, see Gruendler and Toral,
                eds., <i>An Unruly Classic</i>, Leiden and Boston 2024,
                <a href="https://brill.com/edcollbook/title/64276" target="_blank">
                  https://brill.com/edcollbook/title/64276</a
                >). <br /><br />
                <span
                  (click)="toggleReadMoreManuscriptsDescription()"
                  style="cursor: pointer; color: blue; display: block; margin-top: 5px"
                  >Read less</span
                >
              </span>
              <button (click)="navigateTo('/description')">View</button>
            </div>
          </div>
          <div class="box">
            <div class="content">
              <img
                src="{{ manuscriptEndPoint + 'about/translation.png' }}"
                alt="Box 3 Image"
              />

              <p class="box-title">ENGLISH TRANSLATIONS</p>
              <p>
                For non-specialist readers, we provide a near-verbatim
                <b>English translation</b> of one chapter (The
                <i>Cat and the Rat</i>, abbreviated Mc), which imitates features
                of the various witnesses such as word order and line breaks
                whenever feasible.
                <span
                  *ngIf="!showMoreTranslation"
                  (click)="toggleReadMoreTranslation()"
                  style="cursor: pointer; color: blue"
                  >...read more</span
                >
              </p>
              <span *ngIf="showMoreTranslation">
                In rendering each witness into English, we strove to replicate
                various formulations as they differed, whether by enlargement or
                abbreviation, from one witness to the next. As such, we signaled
                any additions, however small, any drops of words that affect the
                meaning of sentences, and any individual words whose connotation
                changes according to the combinations in which they appear.
                <br /><br />
                In all instances, we have made an effort to remain close to each
                version as it was produced, with minimal emendation, so that the
                reader of the synoptic collation can compare the individual
                choices across the witnesses both in Arabic and in English.
                <br /><br />
                <span
                  (click)="toggleReadMoreTranslation()"
                  style="cursor: pointer; color: blue; display: block; margin-top: 5px"
                  >Read less</span
                >
              </span>
              <button
                (click)="navigateTo('/manuscripts/CCCP578/McEnglish/228')"
              >
                View
              </button>
            </div>
          </div>
          <div class="box">
            <div class="content">
              <img
                src="{{ manuscriptEndPoint + 'about/gallery.png' }}"
                alt="Box 6 Image"
              />
              <p class="box-title">GALLERY</p>
              <p>
                The Gallery shows for each manuscript featured in the Edition
                all <b>pages</b> at a glance (including those with illustrations
                or gaps left for illustrations) and a
                <b>close-up version</b> of any given page. <br /><br />
                It permits quickly comparing the different lengths of each
                chapter, the frequency of illustrations in each manuscript,
                restored pages, and changes of the manuscript hand.

                <span
                  *ngIf="!showMoreGallery"
                  (click)="toggleReadMoreGallery()"
                  style="cursor: pointer; color: blue"
                  >...read more</span
                >
              </p>
              <span *ngIf="showMoreGallery">
                The choice of scenes illustrated in each manuscript constitutes
                its <b>image cycle</b>, which serves, in addition to the text
                version, as a parameter of classification. <br /><br />
                <span
                  (click)="toggleReadMoreGallery()"
                  style="cursor: pointer; color: blue; display: block; margin-top: 5px"
                  >Read less</span
                >
              </span>
              <button (click)="navigateTo('/manuscripts/P400/gallery')">
                View
              </button>
            </div>
          </div>

          <!-- Box 7 -->
          <div class="box">
            <div class="content">
              <img
                src="{{ manuscriptEndPoint + 'about/illustration.png' }}"
                alt="Box 7 Image"
              />
              <p class="box-title">ILLUSTRATIONS</p>
              <p>
                This view extracts only the <b>illustrations</b> of each
                manuscript organized per chapter. It permits comparing which
                scenes per manuscript have received illustration (i.e., its
                <b>image cycle</b>) and comparing the chosen motifs as well as
                their different styles of rendition. <br /><br />Some
                manuscripts contain only
                <b>gaps left for illustrations</b> for intended illustrations
                that have not been inserted or completed; their points of
                insertion as well as any <b>captions</b> (such as in Paris 3466)
                nonetheless provide important information.
                <span
                  *ngIf="!showMoreIllustrations"
                  (click)="toggleReadMoreIllustrations()"
                  style="cursor: pointer; color: blue"
                  >... read more</span
                >
              </p>
              <span *ngIf="showMoreIllustrations">
                (For further detail see the chapter by Rima Redwan in Gruendler
                and Toral, eds., <i>An Unruly Classic</i>, Leiden and Boston
                2024,
                <a href="https://brill.com/edcollbook/title/64276" target="_blank"
                  >https://brill.com/edcollbook/title/64276</a
                >). <br /><br />
                <span
                  (click)="toggleReadMoreIllustrations()"
                  style="cursor: pointer; color: blue; display: block; margin-top: 5px"
                  >Read less</span
                >
              </span>
              <button (click)="navigateTo('/manuscripts/illustrations')">
                View
              </button>
            </div>
          </div>
        </div>
      </main>
    </kd-layout>
  `,
  styleUrls: ['./main-page.component.scss'],
  standalone: false,
})
export class MainPageComponent {
  showMore = false;
  toggleReadMore() {
    this.showMore = !this.showMore;
  }

  showMoreManuscripts = false;
  toggleReadMoreManuscripts() {
    this.showMoreManuscripts = !this.showMoreManuscripts;
  }

  showMoreCollations = false;
  toggleReadMoreCollations() {
    this.showMoreCollations = !this.showMoreCollations;
  }

  showMoreManuscriptsDescription = false;

  toggleReadMoreManuscriptsDescription() {
    this.showMoreManuscriptsDescription = !this.showMoreManuscriptsDescription;
  }

  showMoreTranslation = false;

  toggleReadMoreTranslation() {
    this.showMoreTranslation = !this.showMoreTranslation;
  }

  showMoreGallery = false;

  toggleReadMoreGallery() {
    this.showMoreGallery = !this.showMoreGallery;
  }
  showMoreIllustrations = false;

  toggleReadMoreIllustrations() {
    this.showMoreIllustrations = !this.showMoreIllustrations;
  }
  manuscriptEndPoint = this.config.imagesEndPoint + 'manuscripts/';
  version = this.config.version;

  constructor(
    @Inject(CONFIG_TOKEN) private config: IConfig,
    private router: Router
  ) {}
  navigateTo(route: string) {
    // Navigates to the specified route
    this.router.navigate([route]);
  }
}
